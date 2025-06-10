import Image from 'next/image'

export function Header() {
    return (
        <header className="relative h-[180px] w-full -mb-8">
            <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    backgroundImage: 'url(/assets/header-shape.svg)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center'
                }}
            />

            {/* Logo over banner */}
            <div className="absolute top-[90px] left-[90px] transform -translate-x-1/2 -translate-y-1/2 z-10">
                <Image src="/assets/logos/MediQ_Logo_Light.svg"
                       alt="MediQ Logo"
                       width={60}
                       height={60}
                       className="w-[4vw] h-[4vw] min-w-[120px] min-h-[120px] max-w-[200px] max-h-[200px]"
                />
            </div>
        </header>
    )
}