module.exports = {
    up: async ({ context: queryInterface, Sequelize }) => {
        await queryInterface.createTable('content_ai', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            content_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'contents',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },

            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },

            type: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: 'summary'
            },

            ai_response: {
                type: Sequelize.TEXT('long'),
                allowNull: false
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async ({ context: queryInterface }) => {
        await queryInterface.dropTable('content_ai');
    }
};
