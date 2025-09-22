import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        const { nome, cpf, endereco, declaracao, email, telefone } = req.body;

        if (!nome || !cpf || !endereco || !declaracao || !email || !telefone) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }
        
        const cleanedCpf = cpf.replace(/[^\d]/g, ''); 
        if (cleanedCpf.length !== 11) {
            return res.status(400).json({ message: 'CPF inválido.' });
        }

        const { data: existing, error: findError } = await supabase
            .from('assinaturas')
            .select('cpf')
            .eq('cpf', cleanedCpf)
            .limit(1);

        if (findError) throw findError;
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Este CPF já assinou o abaixo-assinado.' });
        }

        const cleanedTelefone = telefone.replace(/\D/g, '');

        // --- MUDANÇAS AQUI ---
        // 1. Captura o endereço IP do usuário.
        // O Vercel nos fornece o IP através do header 'x-forwarded-for'.
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

        // 2. Cria um timestamp (data e hora) no formato ISO, que o Supabase entende.
        const signatureTimestamp = new Date().toISOString();
        // --- FIM DAS MUDANÇAS ---

        const { error: insertError } = await supabase
            .from('assinaturas')
            .insert([{ 
                nome, 
                cpf: cleanedCpf, 
                endereco, 
                email, 
                telefone: cleanedTelefone,
                data_assinatura: signatureTimestamp, // Salva a data e hora
                endereco_ip: userIp                 // Salva o IP
            }]);
        
        if (insertError) throw insertError;

        const { count, error: countError } = await supabase
            .from('assinaturas')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        return res.status(201).json({ message: 'Assinatura registrada!', newCount: count });

    } catch (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ message: "Ocorreu um erro ao registrar sua assinatura." });
    }
}