const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const ContentAI = require('./content_ai');

const Content = sequelize.define('Content', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(200) },
    description: { type: DataTypes.TEXT },
    deadline: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('draft', 'in_progress', 'done'), defaultValue: 'draft' }
});

// Relations
User.hasMany(Content, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Content.belongsTo(User, { foreignKey: 'user_id' });

Content.hasMany(ContentAI, {
    foreignKey: 'content_id',
    as: 'ai_logs',
    onDelete: 'CASCADE'
});

ContentAI.belongsTo(Content, {
    foreignKey: 'content_id',
    as: 'content'
});

module.exports = Content;
