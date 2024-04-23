const express = require('express');
const assert = require('assert');
const restify = require('restify-clients');
const router = express.Router();

// Cria um cliente JSON para se comunicar com um servidor Restify
const client = restify.createJsonClient({
  url: 'http://localhost:4000',
  retry: false, // Reduz a chance de repetição de chamadas falhadas
});

/* GET users listing. */
router.get('/', (req, res, next) => {
  client.get('/users', (err, request, response, obj) => {
    if (err) {
      console.error('Erro ao obter lista de usuários:', err);
      return res.status(500).json({ error: 'Erro ao obter lista de usuários' });
    }

    res.json(obj);
  });
});

/* GET user by ID */
router.get('/:id', (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID é necessário' });
  }

  client.get(`/users/${userId}`, (err, request, response, obj) => {
    if (err) {
      console.error(`Erro ao obter usuário ${userId}:`, err);
      return res.status(500).json({ error: `Erro ao obter usuário com ID ${userId}` });
    }

    res.json(obj);
  });
});

/* POST to create a new user */
router.post('/', (req, res, next) => {
  const newUser = req.body;

  if (!newUser || Object.keys(newUser).length === 0) {
    return res.status(400).json({ error: 'Dados do usuário são necessários para criar um usuário' });
  }

  client.post('/users', newUser, (err, request, response, obj) => {
    if (err) {
      console.error('Erro ao criar usuário:', err);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    res.status(201).json(obj); // Retorna 201 Created para indicar criação bem-sucedida
  });
});

/* PUT to update a user by ID */
router.put('/:id', (req, res, next) => {
  const userId = req.params.id;
  const updatedData = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID é necessário para atualizar' });
  }

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ error: 'Dados para atualização são necessários' });
  }

  client.put(`/users/${userId}`, updatedData, (err, request, response, obj) => {
    if (err) {
      console.error(`Erro ao atualizar usuário ${userId}:`, err);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }

    res.json(obj);
  });
});

/* DELETE to remove a user by ID */
router.delete('/:id', (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID é necessário para excluir' });
  }

  client.del(`/users/${userId}`, (err, request, response, obj) => {
    if (err) {
      console.error(`Erro ao excluir usuário ${userId}:`, err);
      return res.status(500).json({ error: 'Erro ao excluir usuário' });
    }

    res.json({ success: `Usuário com ID ${userId} foi excluído` });
  });
});

module.exports = router;
