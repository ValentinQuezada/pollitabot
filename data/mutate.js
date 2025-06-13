const values = require('./groupPhase.json');


/* 
team1: String,
team2: String,
datetime: Date,
group: String,
*/
const format = values.flatMap((value) => {
    let date = value.date; // dd/yy
    const matches = value.matches.map((match) => {
        let team1 = match.match.split(' vs ')[0];
        let team2 = match.match.split(' vs ')[1];
        let group = match.group;
        let time = match.time; // HrAm/pm
        let day = +date.split('/')[0];
        let month = +date.split('/')[1];
        let year = new Date().getFullYear();

        let hours = +time.slice(0, time.length - 2);
        let ampm = time.slice(time.length - 2);

        if (ampm === 'pm') {
            hours = hours + 12;
        }
        console.log(hours)

        let datetime = new Date(year, month-1, day, hours);
        return {team1, team2, datetime, group, matchType: "group-regular", isFinished: false, hasStarted: false };
    })
    return matches;
})

console.log(JSON.stringify(format));