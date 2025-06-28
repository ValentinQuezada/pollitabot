export const CALLABLES = {
    sendScorePrediction: (userId: string, team1: string, team2: string, sup: string) => `*🎯​ ¡<@${userId}> ha enviado su resultado para **${team1} vs. ${team2}${sup}**!*`,
    updateScorePrediction: (userId: string, team1: string, team2: string, sup: string) => `*✏️​ ¡<@${userId}> ha actualizado su resultado para **${team1} vs. ${team2}${sup}**!*`,
    sendOtherPrediction: (ownerId: string, userId: string, team1: string, team2: string, sup: string) => `*🎯​ ¡<@${ownerId}> ha enviado el resultado de <@${userId}> para **${team1} vs. ${team2}${sup}**!*`,
    updateOtherPrediction: (ownerId: string, userId: string, team1: string, team2: string, sup: string) => `*✏️​ ¡<@${ownerId}> ha actualizado el resultado de <@${userId}> para **${team1} vs. ${team2}${sup}**!*`
}