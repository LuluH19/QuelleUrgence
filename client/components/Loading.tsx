function Loading({message, ariaLabel}: {message: string, ariaLabel?: string}) {
    return (
        <div className="p-8 text-center" role="status" aria-live="polite">
            <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
            <p className="mt-4 text-black font-medium">{message}</p>
            {ariaLabel && <span className="sr-only">{ariaLabel}</span>}
        </div>
    )
}

export default Loading;