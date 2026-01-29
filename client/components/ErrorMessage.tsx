function ErrorMessage({message}: {message: string}){
    return (
        <div className="p-4 bg-rose-50 border-rose-300 border rounded-lg" role="alert" aria-live="assertive">
            <p className="text-rose-700 font-medium">⚠️ {message}</p>
        </div>
    )
}

export default ErrorMessage;