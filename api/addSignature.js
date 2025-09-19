import { createClient } from '@supabase/supabase-js';

// Conecta ao Supabase usando as chaves de ambiente (mais seguro!)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        const { nome, endereco, declaracao, email } = req.body;

        if (!nome || !endereco || !declaracao) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }

        if (findError) throw findError;
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Este Título de Eleitor já assinou.' });
        }

        // Insere a nova assinatura
        const { error: insertError } = await supabase
            .from('assinaturas')
            .insert([{ nome, endereco, email }]);
        
        if (insertError) throw insertError;

        // Pega a nova contagem total
        const { count, error: countError } = await supabase
            .from('assinaturas')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        return res.status(201).json({ message: 'Assinatura registrada!', newCount: count });

    } catch (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
}