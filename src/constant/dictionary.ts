const CALLABLES = {
    sendScorePrediction: (userId: string, team1: string, team2: string) => `*🎯​ ¡<@${userId}> ha enviado su resultado para **${team1} vs. ${team2}**!*`,
    updateScorePrediction: (userId: string, team1: string, team2: string) => `*✏️​ ¡<@${userId}> ha actualizado su resultado para **${team1} vs. ${team2}**!*`
}