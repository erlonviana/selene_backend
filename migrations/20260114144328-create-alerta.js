'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alertas', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
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
      configuracao_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'configuracoes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      severidade: {
        type: Sequelize.ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA'),
        defaultValue: 'MEDIA'
      },
      mensagem: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      valor_medido: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      valor_limite: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      resolvido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      acao_gerada_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      observacoes_resolucao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolvido_em: {
        type: Sequelize.DATE,
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
    
    // Índices para performance
    await queryInterface.addIndex('alertas', ['resolvido']);
    await queryInterface.addIndex('alertas', ['timestamp']);
    await queryInterface.addIndex('alertas', ['tipo']);
    await queryInterface.addIndex('alertas', ['severidade']);
    await queryInterface.addIndex('alertas', ['dispositivo_id']);
    await queryInterface.addIndex('alertas', ['planta_id']);
    await queryInterface.addIndex('alertas', ['configuracao_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('alertas');
  }
};