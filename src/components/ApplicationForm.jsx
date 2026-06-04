import { useState } from 'react'

const ApplicationForm = ({ pet, token, onCancel, onSubmitted }) => {
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        housingType: '',
        hasYard: false,
        hasOtherPets: false,
        petExperience: '',
        reasonForAdoption: '',
        message: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    petId: pet._id || pet.id || pet.petId,
                    ...formData,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit application')
            }

            onSubmitted(data.data._id || data.data.id)
        } catch (error) {
            console.error(error)
            alert(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Adoption application</p>
                    <h2 className="mt-2 mb-0 font-serif text-[34px] leading-tight text-[#0F2A44]">
                        Apply to Adopt {pet.name}
                    </h2>
                    <p className="mt-2 mb-0 text-[#67686d] text-[15px] leading-6">
                        Tell the shelter about your home and experience so they can review your application.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-full border border-[#d7d7d9] bg-white px-3 py-1 text-lg leading-none text-[#55585f]"
                    aria-label="Close application form"
                >
                    x
                </button>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="address">
                Address
                <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="phone">
                    Phone
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="city">
                    City
                    <input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="state">
                    State
                    <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="zipCode">
                    Zip Code
                    <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="housingType">
                    Housing type
                    <select
                        id="housingType"
                        name="housingType"
                        value={formData.housingType}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                    >
                        <option value="">Select one</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="house">House</option>
                    </select>
                </label>

                <div className="grid content-end gap-2 rounded-lg border border-[#d7d7d9] bg-[#f9fafb] p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2f3034]">
                        <input
                            type="checkbox"
                            name="hasYard"
                            checked={formData.hasYard}
                            onChange={handleChange}
                            className="h-4 w-4 accent-[#0F2A44]"
                        />
                        Has yard or outdoor space
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2f3034]">
                        <input
                            type="checkbox"
                            name="hasOtherPets"
                            checked={formData.hasOtherPets}
                            onChange={handleChange}
                            className="h-4 w-4 accent-[#0F2A44]"
                        />
                        Has other pets
                    </label>
                </div>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="petExperience">
                Pet experience
                <textarea
                    id="petExperience"
                    name="petExperience"
                    rows="3"
                    value={formData.petExperience}
                    onChange={handleChange}
                    placeholder="Tell us about your experience caring for pets."
                    required
                    className="resize-y rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="reasonForAdoption">
                Why do you want to adopt {pet.name}?
                <textarea
                    id="reasonForAdoption"
                    name="reasonForAdoption"
                    rows="3"
                    value={formData.reasonForAdoption}
                    onChange={handleChange}
                    placeholder="Why would you like to adopt this pet?"
                    required
                    className="resize-y rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#2f3034]" htmlFor="message">
                Additional message <span className="font-normal text-[#67686d]">(optional)</span>
                <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Anything else you'd like us to know?"
                    className="resize-y rounded-lg border border-[#d7d7d9] bg-white px-3 py-2 text-base outline-none focus:border-[#0F2A44]"
                />
            </label>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#ececef] pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-[#c5c6cb] bg-white px-5 py-2.5 text-base font-semibold text-[#2f3034] disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg border-2 border-[#0F2A44] bg-[#0F2A44] px-5 py-2.5 text-base font-semibold text-white disabled:opacity-60"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    )
}

export default ApplicationForm