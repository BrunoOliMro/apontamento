export default async function post(url, values) {
    console.log('values', values);
    let res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            values: !values ? "" : values,
        }),
    }).then((res)=> res.json())
    return res
}