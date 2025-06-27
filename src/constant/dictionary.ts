export const CALLABLES = {
    sendScorePrediction: (userId: string, team1: string, team2: string, sup: string) => `*🎯​ ¡<@${userId}> ha enviado su resultado para **${team1} vs. ${team2}${sup}**!*`,
    updateScorePrediction: (userId: string, team1: string, team2: string, sup: string) => `*✏️​ ¡<@${userId}> ha actualizado su resultado para **${team1} vs. ${team2}${sup}**!*`
}