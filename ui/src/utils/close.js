export default async function close({ values }) {
    values = {
        string: [],
        bool: [],
        redirect: ``
    }
    values.string = ''
    if (values.bool === false) {
        values.bool = true
    } else {
        values.bool = false
    }

    if (values.redirect !== '') {
        window.location.href = values.redirect;
    }
    return
}