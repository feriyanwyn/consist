const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentAI = sequelize.define('ContentAI', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    user_id: { type: DataTypes.INTEGER, allowNull: false },

    content_id: { type: DataTypes.INTEGER, allowNull: false },

    type: { type: DataTypes.STRING(50), allowNull: false },

    ai_response: { type: DataTypes.TEXT('long'), allowNull: false }
}, {
    tableName: 'content_ai',
    timestamps: true
});

module.exports = ContentAI;
