import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    try {
        const { count, error } = await supabase
            .from('assinaturas')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        
        return res.status(200).json({ count: count });

    } catch (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ message: 'Erro interno ao buscar contagem.' });
    }
}