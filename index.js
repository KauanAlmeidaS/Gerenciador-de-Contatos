const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
pool.on('connect', () => {
    console.log('Base de dados conectada com sucesso!');
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/contatos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contatos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao consultar contatos:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/contatos', async (req, res) => {
    const { nome, telefone, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO contatos (nome, telefone, email) VALUES ($1, $2, $3) RETURNING *',
            [nome, telefone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao adicionar contato:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE contatos SET nome = $1, telefone = $2, email = $3 WHERE id = $4 RETURNING *',
            [nome, telefone, email, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar contato:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM contatos WHERE id = $1', [id]);
        res.status(204).end();
    } catch (err) {
        console.error('Erro ao deletar contato:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
