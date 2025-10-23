"use client"

import { useState, useEffect } from "react"

interface Service {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  featured?: boolean
}

interface AddOn {
  id: string
  name: string
  price: number
}

interface APIService {
  id: string
  name: string
  duration: number
  price: {
    cents: number
    formatted: string
  }
}

interface APIAddOn {
  id: string
  name: string
  duration: number
  price: {
    cents: number
    formatted: string
  }
}

export default function BookPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch services and add-ons from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()

        // Map API services to frontend format with features
        const serviceFeatures: Record<string, string[]> = {
          'Basic Wash': [
            "Exterior hand wash",
            "Wheel & tire cleaning",
            "Window cleaning",
            "Quick interior vacuum",
            "Dashboard wipe-down"
          ],
          'Premium Detail': [
            "Everything in Basic Wash",
            "Clay bar treatment",
            "Premium wax application",
            "Interior deep cleaning",
            "Leather conditioning",
            "Carpet & upholstery cleaning"
          ],
          'Luxury Package': [
            "Everything in Premium Detail",
            "Paint correction (1-step)",
            "Ceramic coating application",
            "Headlight restoration",
            "Interior protection treatment",
            "90-day protection guarantee"
          ]
        }

        const formattedServices: Service[] = data.services.map((svc: APIService) => ({
          id: svc.id,
          name: svc.name,
          price: svc.price.cents / 100,
          duration: formatDuration(svc.duration),
          features: serviceFeatures[svc.name] || [],
          featured: svc.name === 'Premium Detail'
        }))

        const formattedAddOns: AddOn[] = data.addOns.map((addon: APIAddOn) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price.cents / 100
        }))

        setServices(formattedServices)
        setAddOns(formattedAddOns)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching services:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) return `${mins} minutes`
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`

    return `${hours}-${hours + 1} hours`
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const servicePrice = selectedServiceData?.price || 0

  const addOnsTotal = selectedAddOns.reduce((total, addonId) => {
    const addon = addOns.find(a => a.id === addonId)
    return total + (addon?.price || 0)
  }, 0)

  const grandTotal = servicePrice + addOnsTotal

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
  }

  const handleAddOnToggle = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleContinue = () => {
    if (selectedService) {
      alert(`Booking Summary:\n\nService: ${selectedServiceData?.name} - $${servicePrice}\nAdd-ons: ${selectedAddOns.length > 0 ? selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).join(', ') : 'None'}\n\nTotal: $${grandTotal}\n\nNext steps (Vehicle Info, Scheduling, etc.) coming soon!\n\nFor now, please call (555) 626-9810 to complete your booking.`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Book Your Service</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule your professional auto detailing appointment in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">
                1
              </div>
              <span className="text-sm font-semibold text-blue-600">Select Service</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                2
              </div>
              <span className="text-sm text-gray-500">Vehicle Info</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                3
              </div>
              <span className="text-sm text-gray-500">Schedule</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                4
              </div>
              <span className="text-sm text-gray-500">Confirm</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Choose Your Service Package</h2>
            <p className="text-gray-600">Select the detailing service that best fits your needs</p>
          </div>

          {/* Service Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedService === service.id
                    ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                    : service.featured
                    ? 'border-blue-300 hover:border-blue-400 hover:shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{service.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">${service.price}</div>
                </div>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-gray-600 text-sm mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ⏱️ {service.duration}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    selectedService === service.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedService === service.id ? '✓ Selected' : 'Select ' + service.name}
                </button>
              </div>
            ))}
          </div>

          {/* Add-Ons Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Optional Add-Ons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAddOns.includes(addon.id)
                      ? 'border-blue-600 bg-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addon.id)}
                    onChange={() => handleAddOnToggle(addon.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{addon.name}</div>
                    <div className="text-blue-600 font-bold">+${addon.price}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Booking Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Selected Service:</span>
                <span className="font-bold text-gray-900">
                  {selectedServiceData ? `${selectedServiceData.name} - $${servicePrice}` : 'Please select a service'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Add-ons:</span>
                <span className="font-bold text-blue-600">${addOnsTotal}</span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="pl-4 text-sm text-gray-600">
                  {selectedAddOns.map(id => {
                    const addon = addOns.find(a => a.id === id)
                    return (
                      <div key={id} className="flex justify-between py-1">
                        <span>• {addon?.name}</span>
                        <span>+${addon?.price}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex justify-between items-center py-4 bg-blue-50 px-4 rounded-lg">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-blue-600">${grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedService}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
                selectedService
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Vehicle Info →
            </button>
          </div>

          {/* Emergency Contact */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Need Help or Have Questions?</h3>
            <p className="text-gray-600 mb-4">Our team is standing by to help you with your booking</p>
            <a
              href="tel:+15556269810"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Call (555) 626-9810
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
