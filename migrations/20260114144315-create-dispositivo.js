'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dispositivos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      mac_address: {
        type: Sequelize.STRING(17),
        allowNull: false,
        unique: true
      },
      nome: {
        type: Sequelize.STRING(50),
        defaultValue: 'Novo Dispositivo'
      },
      tipo: {
        type: Sequelize.ENUM('ESP32_SENSORES', 'ESP32_CAM'),
        defaultValue: 'ESP32_SENSORES'
      },
      localizacao: {
        type: Sequelize.STRING(100),
        allowNull: true
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
      online: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ultima_comunicacao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      configuracao: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    
    // Índices
    await queryInterface.addIndex('dispositivos', ['mac_address']);
    await queryInterface.addIndex('dispositivos', ['tipo']);
    await queryInterface.addIndex('dispositivos', ['online']);
    await queryInterface.addIndex('dispositivos', ['planta_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dispositivos');
  }
};