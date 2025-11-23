import React from 'react'
import navItems from '../constants/navbarConstants'

const Navbar = () => {
    return (
        <header>
            <nav>
                <img src='/logo.svg' alt='Apple logo' />

                <ul>
                    {navItems.map(({label}) => (
                        <li key={label}>{label}</li>
                    ))}
                </ul>

                <div className="flex-center gap-3">
                    <button>
                        <img src='/search.svg' alt='Search' />
                    </button>
                    <button>
                        <img src='/cart.svg' alt='Cart' />
                    </button>
                </div>
            </nav>
        </header>
    )
}

export default Navbar