function NotFoundData({message}: {message: string}) {
    return (
        <div className="p-8 text-center bg-white rounded-lg shadow" role="status">
            <p className="text-slate-600 text-lg">{message}</p>
        </div>
    )
}

export default NotFoundData;