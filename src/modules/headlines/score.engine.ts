export interface ScoreBreakdown {
    length: number;
    powerWords: number;
    urgency: number;
    clarity: number;
    curiosity: number;
}

export function calculateHeadlineScore(headline: string): { total: number; breakdown: ScoreBreakdown } {
    const breakdown: ScoreBreakdown = {
        length: 0,
        powerWords: 0,
        urgency: 0,
        clarity: 0,
        curiosity: 0
    };

    // 1. Length Score (ideal: 40-70 characters)
    const len = headline.length;
    if (len >= 40 && len <= 70) breakdown.length = 100;
    else if (len > 70) breakdown.length = Math.max(0, 100 - (len - 70) * 2);
    else breakdown.length = Math.max(0, 100 - (40 - len) * 3);

    // 2. Power Words
    const powerWords = [/grátis/i, /novo/i, /agora/i, /revelado/i, /secreto/i, /dinheiro/i, /lucro/i, /fácil/i, /rápido/i];
    const powerWordCount = powerWords.filter(pw => pw.test(headline)).length;
    breakdown.powerWords = Math.min(100, powerWordCount * 25);

    // 3. Urgency
    const urgencyWords = [/hoje/i, /última chance/i, /acabando/i, /restam/i, /urgente/i, /imediatamente/i];
    const urgencyCount = urgencyWords.filter(uw => uw.test(headline)).length;
    breakdown.urgency = Math.min(100, urgencyCount * 50);

    // 4. Clarity (Simplified: check for punctuation and structure)
    breakdown.clarity = headline.includes('?') || headline.includes('!') ? 90 : 70;

    // 5. Curiosity
    const curiosityTriggers = [/como/i, /por que/i, /método/i, /estratégia/i, /passo a passo/i];
    const curiosityCount = curiosityTriggers.filter(ct => ct.test(headline)).length;
    breakdown.curiosity = Math.min(100, curiosityCount * 40);

    const total = Math.round(
        (breakdown.length * 0.2) +
        (breakdown.powerWords * 0.25) +
        (breakdown.urgency * 0.15) +
        (breakdown.clarity * 0.2) +
        (breakdown.curiosity * 0.2)
    );

    return { total, breakdown };
}
