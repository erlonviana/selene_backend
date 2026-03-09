'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Inserir configurações padrão
    await queryInterface.bulkInsert('configuracoes', [
      // LIMITES para alertas
      {
        chave: 'limite_ph_min',
        valor: '5.5',
        categoria: 'LIMITES',
        descricao: 'pH mínimo aceitável para a solução nutritiva',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_ph_max',
        valor: '6.5',
        categoria: 'LIMITES',
        descricao: 'pH máximo aceitável para a solução nutritiva',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_temp_min',
        valor: '18',
        categoria: 'LIMITES',
        descricao: 'Temperatura mínima em °C',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_temp_max',
        valor: '30',
        categoria: 'LIMITES',
        descricao: 'Temperatura máxima em °C',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_cond_min',
        valor: '800',
        categoria: 'LIMITES',
        descricao: 'Condutividade mínima em µS/cm',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_cond_max',
        valor: '2000',
        categoria: 'LIMITES',
        descricao: 'Condutividade máxima em µS/cm',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'limite_bateria_min',
        valor: '20',
        categoria: 'LIMITES',
        descricao: 'Bateria mínima em % para alerta',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      
      // SISTEMA
      {
        chave: 'intervalo_leitura_sensores',
        valor: '300',
        categoria: 'SISTEMA',
        descricao: 'Intervalo entre leituras dos sensores (segundos)',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'intervalo_leitura_camera',
        valor: '3600',
        categoria: 'SISTEMA',
        descricao: 'Intervalo entre fotos da câmera (segundos)',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'caminho_fotos',
        valor: './fotos_plantas',
        categoria: 'SISTEMA',
        descricao: 'Pasta para armazenamento de fotos',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'timezone',
        valor: 'America/Sao_Paulo',
        categoria: 'SISTEMA',
        descricao: 'Fuso horário do sistema',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      
      // PLANTAS (valores ideais - exemplos)
      {
        chave: 'alface_ph_ideal',
        valor: '6.0',
        categoria: 'PLANTAS',
        descricao: 'pH ideal para cultivo de alface',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'alface_temp_ideal',
        valor: '22',
        categoria: 'PLANTAS',
        descricao: 'Temperatura ideal para alface em °C',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'alface_cond_ideal',
        valor: '1400',
        categoria: 'PLANTAS',
        descricao: 'Condutividade ideal para alface em µS/cm',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      {
        chave: 'manjericao_ph_ideal',
        valor: '5.8',
        categoria: 'PLANTAS',
        descricao: 'pH ideal para manjericão',
        aplicavel_a: 'TODOS',
        criado_em: new Date(),
        atualizado_em: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remover todas as configurações
    await queryInterface.bulkDelete('configuracoes', null, {});
  }
};