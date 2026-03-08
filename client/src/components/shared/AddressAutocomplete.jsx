import { useState, useEffect, useRef } from "react";


function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  onValidationChange,
  placeholder = "Enter address",
  id,
  name,
  className = "",
  required = false,
}) {
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    
    abortControllerRef.current = new AbortController();

    try {
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=us`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          "User-Agent": "EventureApp/1.0", 
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch address suggestions");
      }

      const data = await response.json();
      
      
      const formattedSuggestions = data.map((item) => ({
        display_name: item.display_name,
        address: item.address || {},
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      }
    }
  };

  
  const handleInputChange = (e) => {
    const query = e.target.value;
    
    
    if (onChange) {
      onChange(e);
    }
    
    
    
    if (isAddressSelected && selectedAddressData) {
      const expectedValue = selectedAddressData.selectedValue || selectedAddressData.formatted_address || selectedAddressData.address_line1;
      if (query !== expectedValue) {
        setIsAddressSelected(false);
        setSelectedAddressData(null);
        if (onValidationChange) {
          onValidationChange(false);
        }
      }
    }
    
    
    if (!query) {
      setIsAddressSelected(false);
      setSelectedAddressData(null);
      if (onValidationChange) {
        onValidationChange(false);
      }
    }

    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    
    debounceTimerRef.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  
  const handleSelectAddress = (suggestion) => {
    const addressData = parseAddressComponents(suggestion);
    const selectedValue = suggestion.display_name;
    
    
    setSelectedAddressData({
      ...addressData,
      selectedValue: selectedValue, 
    });
    
    
    const syntheticEvent = {
      target: {
        name: name || "address_line1",
        value: selectedValue,
      },
    };
    
    
    if (onChange) {
      onChange(syntheticEvent);
    }

    
    if (onPlaceSelect) {
      onPlaceSelect(addressData);
    }

    
    setIsAddressSelected(true);
    
    
    if (onValidationChange) {
      onValidationChange(true);
    }

    
    setShowSuggestions(false);
    setSuggestions([]);
    
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  
  const parseAddressComponents = (item) => {
    const addr = item.address || {};
    
    
    const streetNumber = addr.house_number || "";
    const streetName = addr.road || addr.street || "";
    const city = (addr.city || addr.town || addr.village || addr.municipality || "").trim();
    
    
    
    let state = (addr.state || "").trim();
    
    if (state.length > 50) {
      state = state.split(',')[0].trim();
    }
    
    if (state.length > 50) {
      state = state.substring(0, 50);
    }
    
    const zipCode = (addr.postcode || "").trim();
    const country = (addr.country || "").trim();

    
    const addressLine1 = [streetNumber, streetName].filter(Boolean).join(" ");

    return {
      formatted_address: item.display_name,
      address_line1: addressLine1 || item.display_name,
      street_number: streetNumber,
      route: streetName,
      city: city ? city.substring(0, 100) : "", 
      state: state.substring(0, 50), 
      zip_code: zipCode ? zipCode.substring(0, 10) : "", 
      country: country,
      lat: item.lat,
      lng: item.lng,
    };
  };

  
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectAddress(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSuggestions([]);
        break;
    }
  };

  
  useEffect(() => {
    if (isAddressSelected && selectedAddressData) {
      const expectedValue = selectedAddressData.selectedValue || selectedAddressData.formatted_address || selectedAddressData.address_line1;
      if (value !== expectedValue) {
        
        
        if (value && value !== expectedValue) {
          setIsAddressSelected(false);
          setSelectedAddressData(null);
          if (onValidationChange) {
            onValidationChange(false);
          }
        }
      } else if (value === expectedValue && !isAddressSelected) {
        
        setIsAddressSelected(true);
        if (onValidationChange) {
          onValidationChange(true);
        }
      }
    }
  }, [value, isAddressSelected, selectedAddressData, onValidationChange]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`${className} pr-10 ${!isAddressSelected && value ? "border-yellow-500 focus:ring-yellow-500" : ""} ${isAddressSelected ? "border-green-500 focus:ring-green-500" : ""}`}
          required={required}
          autoComplete="off"
        />
        
        {isAddressSelected && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        )}
      </div>
      
      
      {!isAddressSelected && value && (
        <p className="mt-1 text-xs text-yellow-600">
          Please select an address from the dropdown
        </p>
      )}
      
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-[#cad5e2] rounded-lg shadow-lg max-h-60 overflow-auto"
          onMouseDown={(e) => {
            
            e.preventDefault();
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectAddress(suggestion);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? "bg-gray-50" : ""
              } ${index === 0 ? "rounded-t-lg" : ""} ${
                index === suggestions.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              <p className="text-sm text-[#0f172b]">{suggestion.display_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressAutocomplete;
