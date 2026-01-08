
import fetch from 'node-fetch';

async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/clientes');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
