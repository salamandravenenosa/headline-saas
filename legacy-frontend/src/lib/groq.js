import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // For demo purposes, in production this should be in an Edge Function
});

export const generateHeadline = async (niche, briefing, knowledgeBase, style = 'white') => {
    const kbText = knowledgeBase.length > 0
        ? `\nBase de Conhecimento (Frases para inspiração):\n${knowledgeBase.map(kb => `- ${kb.content}`).join('\n')}`
        : '';

    const styleInstructions = style === 'black'
        ? `ESTILO: BLACK (Agressivo, Direct Response pesado).
    Regras Específicas:
    - Use promessas fortes e urgência.
    - Foque em resultados rápidos e "segredos".
    - Pode usar nomes de famosos ou influenciadores se mencionados no briefing (ex: Virginia, famosos).
    - Use gatilhos mentais de "mecanismo único" ou "descoberta proibida".`
        : `ESTILO: WHITE (Suave, Educativo, Seguro).
    Regras Específicas:
    - Use uma abordagem mais amigável e curiosa.
    - Foque em descobertas e aprendizado.
    - Evite promessas de resultados impossíveis sem contexto.
    - Linguagem profissional e persuasiva porém "limpa".`;

    const prompt = `Você é um copywriter elite de Direct Response especializado em Quizzes de alto engajamento.
Sua missão é extrair o máximo de conversão do briefing fornecido.

ESTILO SOLICITADO: ${style.toUpperCase()}
${styleInstructions}

Nicho: ${niche}
Briefing da Oferta: ${briefing}
${kbText}

DESAFIO: Criar uma headline que pareça um "milhão de dólares". Se o briefing citar mecanismos como "caneta emagrecedora" ou famosas como "Virginia", use hooks que causem impacto imediato.

Exemplo de Hook Black: "Descubra se você está 1 passo atrás de perder 5 kg em 30 dias com o segredo da caneta emagrecedora..."

Retorne apenas a headline vencedora, sem comentários extras.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error generating headline:", error);
        throw error;
    }
};
