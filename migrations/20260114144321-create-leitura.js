'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leituras', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      dispositivo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dispositivos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      timestamp: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW')
      },
      tipo_leitura: {
        type: Sequelize.ENUM('SENSORES', 'CAMERA'),
        defaultValue: 'SENSORES'
      },
      temperatura: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      umidade: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      luminosidade: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ph: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      condutividade: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      },
      nivel_agua: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      altura_planta: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      },
      caminho_foto: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      bateria: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      rssi: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      qualidade: {
        type: Sequelize.ENUM('EXCELENTE', 'BOA', 'MEDIA', 'RUIM'),
        defaultValue: 'BOA'
      }
    });
    
    // Índices para performance dos dashboards
    await queryInterface.addIndex('leituras', ['dispositivo_id', 'timestamp']);
    await queryInterface.addIndex('leituras', ['timestamp']);
    await queryInterface.addIndex('leituras', ['ph']);
    await queryInterface.addIndex('leituras', ['temperatura']);
    await queryInterface.addIndex('leituras', ['altura_planta']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('leituras');
  }
};