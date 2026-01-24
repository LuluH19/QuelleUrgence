import Image from "next/image";

function Specification({ fullWidth, imagePath, description }: { fullWidth: boolean; imagePath: string; description: string }) {
    return (
        <div 
        className={`rounded-lg bg-primary text-white p-6 shadow-md flex flex-col gap-4 items-center justify-start ${fullWidth ? 'col-span-full' : ''}`}
        aria-label={description}
        >
            <Image
                src={imagePath}
                alt=""
                width={100}
                height={100}
                quality={100}
                placeholder='blur'
                blurDataURL={imagePath}
                loading="lazy"
            />
            <p className="text-sm md:text-base lg:text-lg font-bold text-center">
                {description}
            </p>
        </div>
    )
}

export default Specification;