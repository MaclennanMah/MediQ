import Image from 'next/image'

export function Header() {
    return (
        <header className="relative" >
            <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    backgroundImage: '/assets/header-shape.svg',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            />

            {/* Logo over Header */}
            <div className="relative z-10 container mx-auto px-6 py-4 flex items-center">
                <div className="flex items-center space-x-3">
                    <Image src="/assets/logos/MediQ_Logo_Dark.svg"
                           alt="MediQ Logo"
                           width={48}
                           height={48}
                           className="h-12 w-12"
                    />
                </div>
            </div>
        </header>
    )
}