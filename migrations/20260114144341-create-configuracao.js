'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      chave: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      valor: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      categoria: {
        type: Sequelize.ENUM('LIMITES', 'SISTEMA', 'PLANTAS', 'DISPOSITIVOS', 'GERAL'),
        defaultValue: 'GERAL'
      },
      descricao: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      aplicavel_a: {
        type: Sequelize.ENUM('TODOS', 'ESPECIFICO'),
        defaultValue: 'TODOS'
      },
      dispositivo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'dispositivos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      planta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'plantas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atualizavel_via_api: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW')
      }
    });
    
    // Índices
    await queryInterface.addIndex('configuracoes', ['chave']);
    await queryInterface.addIndex('configuracoes', ['categoria']);
    await queryInterface.addIndex('configuracoes', ['aplicavel_a']);
    await queryInterface.addIndex('configuracoes', ['dispositivo_id']);
    await queryInterface.addIndex('configuracoes', ['planta_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('configuracoes');
  }
};