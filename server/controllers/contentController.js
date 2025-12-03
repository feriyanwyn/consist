const Content = require('../models/content');
const ContentAI = require('../models/content_ai');
const deepseek = require('../utils/deepseekClient');

module.exports = {
    getOwnContents: async (req, res) => {
        try {
            const user_id = req.user.id;
            const contents = await Content.findAll({ where: { user_id } });
            res.json(contents);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

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

    update: async (req, res) => {
        try {
            const user_id = req.user.id;

            const content = await Content.findOne({
                where: { id: req.params.id, user_id }
            });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.update(req.body);
            const ai_text = await deepseek.generateSummary(
                `Updated Content:\nTitle: ${content.title}\nDescription: ${content.description}`
            );

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
