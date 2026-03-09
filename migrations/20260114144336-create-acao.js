'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('acoes', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      tipo: {
        type: Sequelize.ENUM(
          'IRRIGACAO',
          'AJUSTE_PH',
          'FERTILIZACAO',
          'CALIBRACAO',
          'MANUTENCAO',
          'OUTRO'
        ),
        allowNull: false
      },
      dispositivo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'dispositivos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      planta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'plantas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      alerta_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'alertas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      descricao: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      parametros: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      executado_por: {
        type: Sequelize.ENUM('SISTEMA', 'USUARIO'),
        defaultValue: 'SISTEMA'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sucesso: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    
    // Índices
    await queryInterface.addIndex('acoes', ['tipo']);
    await queryInterface.addIndex('acoes', ['timestamp']);
    await queryInterface.addIndex('acoes', ['executado_por']);
    await queryInterface.addIndex('acoes', ['sucesso']);
    await queryInterface.addIndex('acoes', ['dispositivo_id']);
    await queryInterface.addIndex('acoes', ['planta_id']);
    await queryInterface.addIndex('acoes', ['alerta_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('acoes');
  }
};