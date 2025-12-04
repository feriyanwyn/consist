const Content = require('../models/content');
const ContentAI = require('../models/content_ai');
const deepseek = require('../utils/deepseekClient');
const User = require('../models/user');

module.exports = {
    getOwnContents: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            let contents;
            if (role === 'manager') {
                contents = await Content.findAll({
                    include: [{ model: User, attributes: ['id', 'full_name', 'email', 'team_id'] }]
                });
            } else {
                contents = await Content.findAll({ where: { user_id } });
            }

            res.json(contents);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({
                where,
                include: [{
                    model: ContentAI,
                    as: 'ai_logs',
                    attributes: ['id', 'type', 'ai_response', 'createdAt']
                }]
            });

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

            const content = await Content.create({
                user_id,
                title,
                description,
                deadline,
                status
            });

            const finalPrompt = `
            You are an AI assistant specialized in content strategy and creative planning.
            
            Given the following content information:
            
            Title: ${title}
            Description: ${description}
            
            Your tasks:
            1. Generate a clear and concise summary of the content in 2–4 sentences.
            2. Provide suggestions or improvements related to the content's structure, clarity, or creativity.
            3. Provide a list of 3 potential content ideas or angles relevant to the topic.
            4. The tone must be professional and helpful.
            5. Respond ONLY in Bahasa Indonesia.
            6. Format your response in clean markdown with this structure:
               ## Summary
               ## Suggestions
               ## Ideas
            `;

            const ai_text = await deepseek.generateSummary(finalPrompt);


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
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({ where });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.update(req.body);
            const ai_text = await deepseek.generateSummary(`
            You are an AI assistant specialized in content strategy and creative planning.

            Updated Content:
            Title: ${content.title}
            Description: ${content.description}

            Your tasks:
            1. Generate a clear and concise summary of the updated content in 2–4 sentences.
            2. Provide suggestions or improvements based on the new version of the content.
            3. Provide 3 new potential content ideas or angles relevant to this updated topic.
            4. The tone must be professional and helpful.
            5. Respond ONLY in Bahasa Indonesia.
            6. Format your response in clean markdown with this structure:
            ## Summary
            ## Suggestions
            ## Ideas
            `);

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
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({ where });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.destroy();

            res.json({ message: 'Content deleted (AI logs removed too)' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
