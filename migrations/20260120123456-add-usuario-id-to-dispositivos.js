'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna usuario_id
    await queryInterface.addColumn('dispositivos', 'usuario_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    // Adicionar índice para melhor performance
    await queryInterface.addIndex('dispositivos', ['usuario_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('dispositivos', ['usuario_id']);
    
    // Remover coluna
    await queryInterface.removeColumn('dispositivos', 'usuario_id');
  }
};