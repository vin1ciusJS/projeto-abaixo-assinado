// /api/getSignatures.js
import { createClient } from '@supabase/supabase-js';

// Conecta-se ao Supabase usando as mesmas chaves de ambiente
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Medida de segurança básica: Verificamos um "segredo" enviado pelo frontend
    // Isso impede que qualquer pessoa acesse essa rota diretamente pela URL.
    if (req.method !== 'POST' || req.body.secret !== 'ValparaisoForte2025') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    try {
        // Busca os dados no Supabase, selecionando APENAS as colunas necessárias.
        // O CPF NUNCA é buscado do banco de dados.
        const { data, error } = await supabase
            .from('assinaturas')
            .select('nome, email, endereco, telefone')
            .order('created_at', { ascending: true }); // Ordena por data de assinatura

        if (error) {
            throw error;
        }

        // Retorna a lista de assinaturas em formato JSON
        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro ao buscar assinaturas:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
}