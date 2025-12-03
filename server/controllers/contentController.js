const Content = require('../models/content');
const ContentAI = require('../models/content_ai');
const deepseek = require('../utils/deepseekClient');

module.exports = {
    // Get all contents owned by logged-in user
    getOwnContents: async (req, res) => {
        try {
            const user_id = req.user.id;
            const contents = await Content.findAll({ where: { user_id } });
            res.json(contents);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get a single content owned by current user
    getOne: async (req, res) => {
        try {
            const user_id = req.user.id;
            const content = await Content.findOne({ where: { id: req.params.id, user_id } });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });
            res.json(content);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Create content + AI summary/reference
    create: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { title, description, deadline, status } = req.body;

            // Create content
            const content = await Content.create({
                user_id,
                title,
                description,
                deadline,
                status
            });

            // === Call DeepSeek AI ===
            const ai_text = await deepseek.generateSummary(
                `Title: ${title}\nDescription: ${description}`
            );

            // Save AI response
            await ContentAI.create({
                user_id,
                content_id: content.id,
                type: 'summary',
                ai_response: ai_text
            });

            res.json({
                message: 'Content created with AI summary',
                content,
                ai_summary: ai_text
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Update content + regenerate AI summary
    update: async (req, res) => {
        try {
            const user_id = req.user.id;

            const content = await Content.findOne({
                where: { id: req.params.id, user_id }
            });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            // Update content
            await content.update(req.body);

            // === Call DeepSeek AI ===
            const ai_text = await deepseek.generateSummary(
                `Updated Content:\nTitle: ${content.title}\nDescription: ${content.description}`
            );

            // Save AI result as new history entry
            await ContentAI.create({
                user_id,
                content_id: content.id,
                type: 'summary',
                ai_response: ai_text
            });

            res.json({
                message: 'Content updated with new AI summary',
                content,
                ai_summary: ai_text
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Delete content (auto-delete AI logs via cascade)
    delete: async (req, res) => {
        try {
            const user_id = req.user.id;

            const content = await Content.findOne({
                where: { id: req.params.id, user_id }
            });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.destroy();

            res.json({ message: 'Content deleted (AI logs removed too)' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
