// /api/getSignatures.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST' || req.body.secret !== 'ValparaisoForte2025') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    try {
        // --- CORREÇÃO APLICADA AQUI ---
        // Agora estamos pedindo explicitamente as novas colunas ao banco de dados.
        const { data, error } = await supabase
            .from('assinaturas')
            .select('nome, email, endereco, telefone, data_assinatura, endereco_ip')
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro ao buscar assinaturas:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
}