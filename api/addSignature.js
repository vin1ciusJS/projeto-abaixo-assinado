import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        // VERIFIQUE AQUI: Deve estar esperando 'cpf' e não 'titulo_eleitor'.
        const { nome, cpf, endereco, declaracao, email } = req.body;

        // VERIFIQUE AQUI: A validação deve incluir 'cpf' e 'email'.
        if (!nome || !cpf || !endereco || !declaracao || !email) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }
        
        const cleanedCpf = cpf.replace(/[^\d]/g, ''); 
        if (cleanedCpf.length !== 11) {
            return res.status(400).json({ message: 'CPF inválido. Por favor, insira um CPF com 11 dígitos.' });
        }

        // VERIFIQUE AQUI: A busca por duplicidade deve ser pelo 'cpf'.
        const { data: existing, error: findError } = await supabase
            .from('assinaturas')
            .select('cpf')
            .eq('cpf', cleanedCpf)
            .limit(1);

        if (findError) throw findError;
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Este CPF já assinou o abaixo-assinado.' });
        }

        // VERIFIQUE AQUI: A inserção no banco deve incluir o 'cpf'.
        const { error: insertError } = await supabase
            .from('assinaturas')
            .insert([{ nome, cpf: cleanedCpf, endereco, email }]);
        
        if (insertError) throw insertError;

        const { count, error: countError } = await supabase
            .from('assinaturas')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        return res.status(201).json({ message: 'Assinatura registrada!', newCount: count });

    } catch (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ message: "Ocorreu um erro ao registrar sua assinatura. Tente novamente mais tarde." });
    }
}