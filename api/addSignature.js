import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        // 1. Recebe o novo campo "telefone" junto com os outros
        const { nome, cpf, endereco, declaracao, email, telefone } = req.body;

        // 2. Validação agora inclui o campo "telefone"
        if (!nome || !cpf || !endereco || !declaracao || !email || !telefone) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }
        
        // Limpa o CPF para salvar apenas os números
        const cleanedCpf = cpf.replace(/[^\d]/g, ''); 
        if (cleanedCpf.length !== 11) {
            return res.status(400).json({ message: 'CPF inválido. Por favor, insira um CPF com 11 dígitos.' });
        }

        // Busca por duplicidade usando o CPF limpo
        const { data: existing, error: findError } = await supabase
            .from('assinaturas')
            .select('cpf')
            .eq('cpf', cleanedCpf)
            .limit(1);

        if (findError) throw findError;
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Este CPF já assinou o abaixo-assinado.' });
        }

        // 3. Limpa o telefone para salvar apenas os números
        const cleanedTelefone = telefone.replace(/\D/g, '');

        // 4. Insere o novo campo "telefone" no banco de dados
        const { error: insertError } = await supabase
            .from('assinaturas')
            .insert([{ 
                nome, 
                cpf: cleanedCpf, 
                endereco, 
                email, 
                telefone: cleanedTelefone 
            }]);
        
        if (insertError) throw insertError;

        // Pega a nova contagem total de assinaturas
        const { count, error: countError } = await supabase
            .from('assinaturas')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        // Retorna sucesso com a nova contagem
        return res.status(201).json({ message: 'Assinatura registrada!', newCount: count });

    } catch (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ message: "Ocorreu um erro ao registrar sua assinatura. Tente novamente mais tarde." });
    }
}