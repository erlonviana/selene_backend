'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plantas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      especie: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      variedade: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      data_plantio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      data_colheita_estimada: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      data_colheita_real: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      localizacao: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'GERMINACAO',
          'CRESCIMENTO', 
          'MATURIDADE',
          'COLHIDA',
          'MORTA'
        ),
        defaultValue: 'GERMINACAO'
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plantas');
  }
};