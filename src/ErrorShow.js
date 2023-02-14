export function ErrorShow({ error }) {
    if (!error)
        return <></>

    return <div className="error-detail">
        <textarea value={error} disabled></textarea>
    </div>
}