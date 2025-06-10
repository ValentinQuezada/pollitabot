import BOT_CLIENT from "../init";

const readyEvent = () => {
    console.log(`Logged in as ${BOT_CLIENT.user?.tag}!`);
}

export default readyEvent;