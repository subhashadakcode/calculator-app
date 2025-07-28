"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Calculator,
  History,
  Download,
  Share2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Palette,
  DollarSign,
  Ruler,
  Thermometer,
  BarChart3,
  Trash2,
  Star,
  Zap,
  Clock,
  TrendingUp,
  Menu,
  Info,
  Keyboard,
  Wifi,
  WifiOff,
  RefreshCw,
  CalculatorIcon as CalcIcon,
  ActivityIcon as Function,
  Sigma,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryItem {
  expression: string
  result: string
  timestamp: string
  type: "basic" | "scientific" | "unit" | "currency" | "statistical"
}

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
}

interface StatisticalData {
  values: number[]
  mean?: number
  median?: number
  mode?: number[]
  stdDev?: number
  variance?: number
  min?: number
  max?: number
  sum?: number
  count?: number
}

const themes: ThemeConfig[] = [
  {
    name: "Ocean Blue",
    primary: "from-blue-600 to-cyan-600",
    secondary: "from-blue-500 to-cyan-500",
    accent: "from-teal-500 to-blue-500",
    background: "from-slate-50 via-blue-50 to-cyan-50",
    surface: "bg-white/95 backdrop-blur-sm border-blue-200",
  },
  {
    name: "Sunset Orange",
    primary: "from-orange-500 to-pink-500",
    secondary: "from-orange-400 to-pink-400",
    accent: "from-yellow-500 to-red-500",
    background: "from-orange-50 via-pink-50 to-red-50",
    surface: "bg-white/95 backdrop-blur-sm border-orange-200",
  },
  {
    name: "Forest Green",
    primary: "from-green-600 to-emerald-600",
    secondary: "from-green-500 to-emerald-500",
    accent: "from-lime-500 to-green-500",
    background: "from-green-50 via-emerald-50 to-teal-50",
    surface: "bg-white/95 backdrop-blur-sm border-green-200",
  },
  {
    name: "Royal Purple",
    primary: "from-purple-600 to-indigo-600",
    secondary: "from-purple-500 to-indigo-500",
    accent: "from-violet-500 to-purple-500",
    background: "from-purple-50 via-indigo-50 to-violet-50",
    surface: "bg-white/95 backdrop-blur-sm border-purple-200",
  },
]

const darkThemes: ThemeConfig[] = [
  {
    name: "Dark Ocean",
    primary: "from-blue-600 to-cyan-600",
    secondary: "from-blue-500 to-cyan-500",
    accent: "from-teal-500 to-blue-500",
    background: "from-slate-900 via-blue-900 to-slate-900",
    surface: "bg-slate-800/95 backdrop-blur-sm border-slate-700",
  },
  {
    name: "Dark Sunset",
    primary: "from-orange-500 to-pink-500",
    secondary: "from-orange-400 to-pink-400",
    accent: "from-yellow-500 to-red-500",
    background: "from-slate-900 via-purple-900 to-slate-900",
    surface: "bg-slate-800/95 backdrop-blur-sm border-slate-700",
  },
  {
    name: "Dark Forest",
    primary: "from-green-600 to-emerald-600",
    secondary: "from-green-500 to-emerald-500",
    accent: "from-lime-500 to-green-500",
    background: "from-slate-900 via-green-900 to-slate-900",
    surface: "bg-slate-800/95 backdrop-blur-sm border-slate-700",
  },
  {
    name: "Dark Royal",
    primary: "from-purple-600 to-indigo-600",
    secondary: "from-purple-500 to-indigo-500",
    accent: "from-violet-500 to-purple-500",
    background: "from-slate-900 via-indigo-900 to-slate-900",
    surface: "bg-slate-800/95 backdrop-blur-sm border-slate-700",
  },
]

const unitConversions = {
  length: {
    name: "Length",
    units: {
      m: { name: "Meters", factor: 1 },
      cm: { name: "Centimeters", factor: 100 },
      mm: { name: "Millimeters", factor: 1000 },
      km: { name: "Kilometers", factor: 0.001 },
      in: { name: "Inches", factor: 39.3701 },
      ft: { name: "Feet", factor: 3.28084 },
      yd: { name: "Yards", factor: 1.09361 },
      mi: { name: "Miles", factor: 0.000621371 },
    },
  },
  weight: {
    name: "Weight",
    units: {
      kg: { name: "Kilograms", factor: 1 },
      g: { name: "Grams", factor: 1000 },
      lb: { name: "Pounds", factor: 2.20462 },
      oz: { name: "Ounces", factor: 35.274 },
      ton: { name: "Tons", factor: 0.001 },
    },
  },
  temperature: {
    name: "Temperature",
    units: {
      c: { name: "Celsius", factor: "celsius" },
      f: { name: "Fahrenheit", factor: "fahrenheit" },
      k: { name: "Kelvin", factor: "kelvin" },
    },
  },
  area: {
    name: "Area",
    units: {
      m2: { name: "Square Meters", factor: 1 },
      cm2: { name: "Square Centimeters", factor: 10000 },
      km2: { name: "Square Kilometers", factor: 0.000001 },
      ft2: { name: "Square Feet", factor: 10.7639 },
      in2: { name: "Square Inches", factor: 1550 },
      acre: { name: "Acres", factor: 0.000247105 },
    },
  },
  volume: {
    name: "Volume",
    units: {
      l: { name: "Liters", factor: 1 },
      ml: { name: "Milliliters", factor: 1000 },
      gal: { name: "Gallons", factor: 0.264172 },
      qt: { name: "Quarts", factor: 1.05669 },
      pt: { name: "Pints", factor: 2.11338 },
      cup: { name: "Cups", factor: 4.22675 },
      fl_oz: { name: "Fluid Ounces", factor: 33.814 },
    },
  },
}

const currencies = {
  USD: { name: "US Dollar", rate: 1, symbol: "$" },
  EUR: { name: "Euro", rate: 0.85, symbol: "€" },
  GBP: { name: "British Pound", rate: 0.73, symbol: "£" },
  JPY: { name: "Japanese Yen", rate: 110, symbol: "¥" },
  CAD: { name: "Canadian Dollar", rate: 1.25, symbol: "C$" },
  AUD: { name: "Australian Dollar", rate: 1.35, symbol: "A$" },
  CHF: { name: "Swiss Franc", rate: 0.92, symbol: "CHF" },
  CNY: { name: "Chinese Yuan", rate: 6.45, symbol: "¥" },
  INR: { name: "Indian Rupee", rate: 74.5, symbol: "₹" },
  KRW: { name: "South Korean Won", rate: 1180, symbol: "₩" },
}

export default function CalculatorPro() {
  // Core calculator state
  const [currentExpression, setCurrentExpression] = useState("0")
  const [previousExpression, setPreviousExpression] = useState("")
  const [memoryValue, setMemoryValue] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isScientificMode, setIsScientificMode] = useState(false)
  const [shouldResetScreen, setShouldResetScreen] = useState(false)

  // UI state
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("calculator")
  const [isOnline, setIsOnline] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Unit converter state
  const [unitFrom, setUnitFrom] = useState("m")
  const [unitTo, setUnitTo] = useState("cm")
  const [unitCategory, setUnitCategory] = useState("length")
  const [unitValue, setUnitValue] = useState("")

  // Currency converter state
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [currencyAmount, setCurrencyAmount] = useState("")

  // Statistical calculator state
  const [statisticalData, setStatisticalData] = useState<StatisticalData>({ values: [] })
  const [statInput, setStatInput] = useState("")

  // Add after the other state declarations
  const [showWelcome, setShowWelcome] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  const { toast } = useToast()

  // Service Worker Registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
          toast({
            title: "Offline Mode Ready",
            description: "Calculator will work offline",
          })
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [toast])

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Back Online",
        description: "Internet connection restored",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Offline Mode",
        description: "Calculator continues to work offline",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("calculator-history")
      const savedMemory = localStorage.getItem("calculator-memory")
      const savedTheme = localStorage.getItem("calculator-theme")
      const savedDarkMode = localStorage.getItem("calculator-dark-mode")
      const savedSound = localStorage.getItem("calculator-sound")
      const hasVisited = localStorage.getItem("calculator-visited")

      if (savedHistory) setHistory(JSON.parse(savedHistory))
      if (savedMemory) setMemoryValue(Number.parseFloat(savedMemory))
      if (savedTheme) setCurrentTheme(Number.parseInt(savedTheme))
      if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode))
      if (savedSound) setSoundEnabled(JSON.parse(savedSound))

      if (!hasVisited) {
        setShowWelcome(true)
        setIsFirstVisit(true)
        localStorage.setItem("calculator-visited", "true")
      } else {
        setIsFirstVisit(false)
      }
    } catch (error) {
      console.log("Error loading saved data:", error)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("calculator-history", JSON.stringify(history))
      localStorage.setItem("calculator-memory", memoryValue.toString())
      localStorage.setItem("calculator-theme", currentTheme.toString())
      localStorage.setItem("calculator-dark-mode", JSON.stringify(isDarkMode))
      localStorage.setItem("calculator-sound", JSON.stringify(soundEnabled))
    } catch (error) {
      console.log("Error saving data:", error)
    }
  }, [history, memoryValue, currentTheme, isDarkMode, soundEnabled])

  // Memoized theme configuration
  const currentThemeConfig = useMemo(() => {
    return isDarkMode ? darkThemes[currentTheme] : themes[currentTheme]
  }, [isDarkMode, currentTheme])

  // Enhanced sound function with Web Audio API
  const playSound = useCallback(
    (type: "click" | "success" | "error") => {
      if (!soundEnabled) return
      try {
        if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = context.createOscillator()
          const gainNode = context.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(context.destination)

          const frequencies = { click: 800, success: 1000, error: 400 }
          oscillator.frequency.value = frequencies[type]
          oscillator.type = "sine"

          gainNode.gain.setValueAtTime(0.05, context.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)

          oscillator.start(context.currentTime)
          oscillator.stop(context.currentTime + 0.1)
        }
      } catch (error) {
        console.log("Audio not available")
      }
    },
    [soundEnabled],
  )

  // Expression update function
  const updateExpression = useCallback(
    (value: string, reset = false) => {
      playSound("click")

      if (shouldResetScreen || reset) {
        setCurrentExpression(value === "." ? "0." : value)
        setShouldResetScreen(false)
      } else {
        setCurrentExpression((prev) => {
          if (prev === "0" && value !== ".") return value
          if (value === ".") {
            const lastNumber = prev.split(/[+\-*/()^]/).pop() || ""
            if (lastNumber.includes(".")) return prev
          }
          return prev + value
        })
      }
    },
    [shouldResetScreen, playSound],
  )

  // Enhanced calculation function with better error handling
  const calculateResult = useCallback(() => {
    try {
      if (currentExpression === "0" || currentExpression === "Error") return

      // Enhanced expression preprocessing for maximum accuracy
      const expression = currentExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![0-9])/g, Math.E.toString())
        .replace(/\^/g, "**")
        .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")

      // Enhanced precision calculation using Function constructor with strict mode
      const result = Function('"use strict"; return (' + expression + ")")()

      // Enhanced validation and precision handling
      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid operation")
      }

      // Use high precision formatting for 100% accuracy
      let formattedResult
      if (Math.abs(result) < 1e-10) {
        formattedResult = "0"
      } else if (Math.abs(result) > 1e15) {
        formattedResult = result.toExponential(10)
      } else {
        // Enhanced precision: Use up to 15 significant digits for maximum accuracy
        formattedResult = Number.parseFloat(result.toPrecision(15)).toString()
      }

      addToHistory(currentExpression, formattedResult, "basic")
      setPreviousExpression(currentExpression + " =")
      setCurrentExpression(formattedResult)
      setShouldResetScreen(true)
      playSound("success")
    } catch (error) {
      setCurrentExpression("Error")
      setShouldResetScreen(true)
      playSound("error")
      toast({
        title: "Calculation Error",
        description: "Invalid expression or operation",
        variant: "destructive",
      })
    }
  }, [currentExpression, playSound, toast])

  // Advanced scientific functions
  const calculateFunction = useCallback(
    (func: string) => {
      const value = Number.parseFloat(currentExpression)
      let result: number
      let expression: string

      try {
        switch (func) {
          case "square":
            result = value * value
            expression = `(${value})²`
            break
          case "cube":
            result = value * value * value
            expression = `(${value})³`
            break
          case "sqrt":
            if (value < 0) throw new Error("Cannot calculate square root of negative number")
            result = Math.sqrt(value)
            expression = `√(${value})`
            break
          case "cbrt":
            result = Math.cbrt(value)
            expression = `∛(${value})`
            break
          case "percent":
            result = value / 100
            expression = `${value}%`
            break
          case "factorial":
            result = factorial(value)
            expression = `(${value})!`
            break
          case "sin":
            result = Math.sin(value)
            expression = `sin(${value})`
            break
          case "cos":
            result = Math.cos(value)
            expression = `cos(${value})`
            break
          case "tan":
            result = Math.tan(value)
            expression = `tan(${value})`
            break
          case "asin":
            if (value < -1 || value > 1) throw new Error("Invalid arcsine input")
            result = Math.asin(value)
            expression = `sin⁻¹(${value})`
            break
          case "acos":
            if (value < -1 || value > 1) throw new Error("Invalid arccosine input")
            result = Math.acos(value)
            expression = `cos⁻¹(${value})`
            break
          case "atan":
            result = Math.atan(value)
            expression = `tan⁻¹(${value})`
            break
          case "sinh":
            result = Math.sinh(value)
            expression = `sinh(${value})`
            break
          case "cosh":
            result = Math.cosh(value)
            expression = `cosh(${value})`
            break
          case "tanh":
            result = Math.tanh(value)
            expression = `tanh(${value})`
            break
          case "log":
            if (value <= 0) throw new Error("Cannot calculate logarithm of non-positive number")
            result = Math.log10(value)
            expression = `log(${value})`
            break
          case "ln":
            if (value <= 0) throw new Error("Cannot calculate natural logarithm of non-positive number")
            result = Math.log(value)
            expression = `ln(${value})`
            break
          case "log2":
            if (value <= 0) throw new Error("Cannot calculate log base 2 of non-positive number")
            result = Math.log2(value)
            expression = `log₂(${value})`
            break
          case "exp":
            result = Math.exp(value)
            expression = `e^(${value})`
            break
          case "exp2":
            result = Math.pow(2, value)
            expression = `2^(${value})`
            break
          case "pow10":
            result = Math.pow(10, value)
            expression = `10^(${value})`
            break
          case "pi":
            setCurrentExpression(Math.PI.toString())
            setShouldResetScreen(true)
            return
          case "e":
            setCurrentExpression(Math.E.toString())
            setShouldResetScreen(true)
            return
          case "pow":
            updateExpression("^")
            return
          case "abs":
            result = Math.abs(value)
            expression = `|${value}|`
            break
          case "reciprocal":
            if (value === 0) throw new Error("Cannot divide by zero")
            result = 1 / value
            expression = `1/(${value})`
            break
          case "negate":
            result = -value
            expression = `-(${value})`
            break
          case "random":
            result = Math.random()
            expression = "random()"
            break
          case "floor":
            result = Math.floor(value)
            expression = `floor(${value})`
            break
          case "ceil":
            result = Math.ceil(value)
            expression = `ceil(${value})`
            break
          case "round":
            result = Math.round(value)
            expression = `round(${value})`
            break
          case "deg":
            result = value * (180 / Math.PI)
            expression = `${value} rad to deg`
            break
          case "rad":
            result = value * (Math.PI / 180)
            expression = `${value} deg to rad`
            break
          default:
            return
        }

        // Enhanced precision formatting for 100% accuracy
        let formattedResult
        if (Math.abs(result) < 1e-10) {
          formattedResult = "0"
        } else if (Math.abs(result) > 1e15) {
          formattedResult = result.toExponential(10)
        } else {
          formattedResult = Number.parseFloat(result.toPrecision(15)).toString()
        }

        addToHistory(expression, formattedResult, "scientific")
        setCurrentExpression(formattedResult)
        setShouldResetScreen(true)
        playSound("success")
      } catch (error) {
        setCurrentExpression("Error")
        setShouldResetScreen(true)
        playSound("error")
        toast({
          title: "Function Error",
          description: error instanceof Error ? error.message : "Invalid operation",
          variant: "destructive",
        })
      }
    },
    [currentExpression, playSound, toast, updateExpression],
  )

  // Enhanced factorial function
  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial is only defined for non-negative integers")
    if (n === 0 || n === 1) return 1
    if (n > 170) throw new Error("Factorial result too large (maximum: 170!)")

    // Use iterative approach for better precision
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  // Statistical calculations
  const calculateStatistics = useCallback((values: number[]) => {
    if (values.length === 0) return {}

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const mean = sum / values.length

    // Median
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]

    // Mode
    const frequency: { [key: number]: number } = {}
    values.forEach((val) => (frequency[val] = (frequency[val] || 0) + 1))
    const maxFreq = Math.max(...Object.values(frequency))
    const mode = Object.keys(frequency)
      .filter((key) => frequency[Number(key)] === maxFreq)
      .map(Number)

    // Standard deviation and variance
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    return {
      values,
      mean,
      median,
      mode: mode.length === values.length ? [] : mode,
      stdDev,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      sum,
      count: values.length,
    }
  }, [])

  // Add statistical data
  const addStatisticalValue = useCallback(() => {
    const value = Number.parseFloat(statInput)
    if (isNaN(value)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    const newValues = [...statisticalData.values, value]
    const newStats = calculateStatistics(newValues)
    setStatisticalData(newStats)
    setStatInput("")
    playSound("success")
  }, [statInput, statisticalData.values, calculateStatistics, playSound, toast])

  // Clear statistical data
  const clearStatisticalData = useCallback(() => {
    setStatisticalData({ values: [] })
    playSound("click")
  }, [playSound])

  // History management
  const addToHistory = useCallback((expression: string, result: string, type: HistoryItem["type"]) => {
    const newItem: HistoryItem = {
      expression,
      result,
      timestamp: new Date().toLocaleTimeString(),
      type,
    }
    setHistory((prev) => [newItem, ...prev.slice(0, 99)]) // Increased to 100 items
  }, [])

  // Unit conversion with enhanced error handling
  const convertUnit = useCallback(() => {
    if (!unitValue || unitValue.trim() === "") {
      toast({
        title: "Input Required",
        description: "Please enter a value to convert",
        variant: "destructive",
      })
      return
    }

    const value = Number.parseFloat(unitValue)
    if (isNaN(value)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    try {
      const category = unitConversions[unitCategory as keyof typeof unitConversions]
      if (unitCategory === "temperature") {
        let result = value
        if (unitFrom === "f") result = ((value - 32) * 5) / 9
        if (unitFrom === "k") result = value - 273.15

        if (unitTo === "f") result = (result * 9) / 5 + 32
        if (unitTo === "k") result = result + 273.15

        addToHistory(`${value}°${unitFrom.toUpperCase()}`, `${result.toFixed(4)}°${unitTo.toUpperCase()}`, "unit")
        setCurrentExpression(result.toFixed(4))
      } else {
        const fromFactor = (category.units as any)[unitFrom].factor
        const toFactor = (category.units as any)[unitTo].factor
        const result = (value / fromFactor) * toFactor

        addToHistory(`${value} ${unitFrom}`, `${result.toFixed(6)} ${unitTo}`, "unit")
        setCurrentExpression(result.toFixed(6))
      }

      playSound("success")
      toast({
        title: "Conversion Complete",
        description: `${value} ${unitFrom} = ${currentExpression} ${unitTo}`,
      })
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Unable to perform conversion",
        variant: "destructive",
      })
    }
  }, [unitValue, unitCategory, unitFrom, unitTo, addToHistory, playSound, toast, currentExpression])

  // Currency conversion
  const convertCurrency = useCallback(() => {
    if (!currencyAmount || currencyAmount.trim() === "") {
      toast({
        title: "Input Required",
        description: "Please enter an amount to convert",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(currencyAmount)
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    try {
      const fromRate = (currencies as any)[fromCurrency].rate
      const toRate = (currencies as any)[toCurrency].rate
      const result = (amount / fromRate) * toRate

      addToHistory(`${amount} ${fromCurrency}`, `${result.toFixed(2)} ${toCurrency}`, "currency")
      setCurrentExpression(result.toFixed(2))
      playSound("success")
      toast({
        title: "Currency Converted",
        description: `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`,
      })
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Unable to perform currency conversion",
        variant: "destructive",
      })
    }
  }, [currencyAmount, fromCurrency, toCurrency, addToHistory, playSound, toast])

  // Memory operations
  const memoryOperation = useCallback(
    (operation: string) => {
      const currentValue = Number.parseFloat(currentExpression)

      switch (operation) {
        case "MC":
          setMemoryValue(0)
          toast({ title: "Memory Cleared", description: "Memory value reset to 0" })
          break
        case "MR":
          setCurrentExpression(memoryValue.toString())
          setShouldResetScreen(true)
          toast({ title: "Memory Recalled", description: `Value: ${memoryValue}` })
          break
        case "M+":
          if (!isNaN(currentValue)) {
            const newValue = memoryValue + currentValue
            setMemoryValue(newValue)
            toast({ title: "Added to Memory", description: `New memory: ${newValue}` })
          }
          break
        case "M-":
          if (!isNaN(currentValue)) {
            const newValue = memoryValue - currentValue
            setMemoryValue(newValue)
            toast({ title: "Subtracted from Memory", description: `New memory: ${newValue}` })
          }
          break
        case "MS":
          if (!isNaN(currentValue)) {
            setMemoryValue(currentValue)
            toast({ title: "Memory Stored", description: `Stored: ${currentValue}` })
          }
          break
      }
      playSound("click")
    },
    [currentExpression, memoryValue, playSound, toast],
  )

  // Clear functions
  const clearAll = useCallback(() => {
    setCurrentExpression("0")
    setPreviousExpression("")
    setShouldResetScreen(false)
    playSound("click")
  }, [playSound])

  const deleteLast = useCallback(() => {
    if (currentExpression === "Error") {
      setCurrentExpression("0")
    } else if (currentExpression.length === 1) {
      setCurrentExpression("0")
    } else {
      setCurrentExpression((prev) => prev.slice(0, -1))
    }
    playSound("click")
  }, [currentExpression, playSound])

  // Export history with enhanced format
  const exportHistory = useCallback(() => {
    if (history.length === 0) {
      toast({ title: "No History", description: "No calculations to export", variant: "destructive" })
      return
    }

    try {
      let exportData = `Calculator Pro+ - History Export
Generated: ${new Date().toLocaleString()}
Total Calculations: ${history.length}

`
      history.forEach((item, index) => {
        exportData += `${index + 1}. ${item.expression} = ${item.result}
   Type: ${item.type} | Time: ${item.timestamp}

`
      })

      const blob = new Blob([exportData], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `calculator-history-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({ title: "Export Successful", description: "History exported to file" })
    } catch (error) {
      toast({ title: "Export Failed", description: "Unable to export history", variant: "destructive" })
    }
  }, [history, toast])

  // Share app
  const shareApp = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Calculator Pro+",
          text: "Check out this amazing professional calculator app with offline support!",
          url: window.location.href,
        })
        toast({ title: "Shared Successfully", description: "App shared!" })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: "Link Copied", description: "Link copied to clipboard!" })
      }
    } catch (error) {
      toast({ title: "Share Failed", description: "Unable to share app", variant: "destructive" })
    }
  }, [toast])

  // Enhanced keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isMenuOpen) return

      const key = event.key
      if (/[0-9.+\-*/=()%^!]/.test(key) || ["Enter", "Escape", "Backspace", "Delete"].includes(key)) {
        event.preventDefault()
      }

      if (key >= "0" && key <= "9") updateExpression(key)
      if (key === ".") updateExpression(".")
      if (key === "+") updateExpression("+")
      if (key === "-") updateExpression("−")
      if (key === "*") updateExpression("×")
      if (key === "/") updateExpression("÷")
      if (key === "(") updateExpression("(")
      if (key === ")") updateExpression(")")
      if (key === "Enter" || key === "=") calculateResult()
      if (key === "Escape") clearAll()
      if (key === "Backspace") deleteLast()
      if (key === "Delete") clearAll()
      if (key === "%") calculateFunction("percent")
      if (key === "^") calculateFunction("pow")
      if (key === "!") calculateFunction("factorial")
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [updateExpression, calculateResult, clearAll, deleteLast, calculateFunction, isMenuOpen])

  // Statistics calculations
  const stats = useMemo(() => {
    const total = history.length
    const basic = history.filter((h) => h.type === "basic").length
    const scientific = history.filter((h) => h.type === "scientific").length
    const unit = history.filter((h) => h.type === "unit").length
    const currency = history.filter((h) => h.type === "currency").length
    const statistical = history.filter((h) => h.type === "statistical").length

    return {
      total,
      basic,
      scientific,
      unit,
      currency,
      statistical,
      basicPercent: total > 0 ? Math.round((basic / total) * 100) : 0,
      scientificPercent: total > 0 ? Math.round((scientific / total) * 100) : 0,
      conversionPercent: total > 0 ? Math.round(((unit + currency) / total) * 100) : 0,
      statisticalPercent: total > 0 ? Math.round((statistical / total) * 100) : 0,
    }
  }, [history])

  // Welcome Tutorial Dialog
  const WelcomeDialog = () =>
    showWelcome && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className={`w-full max-w-md ${currentThemeConfig.surface} shadow-2xl border-2`}>
          <CardHeader className={`text-center bg-gradient-to-r ${currentThemeConfig.primary} text-white rounded-t-lg`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Welcome to Calculator Pro+!</h2>
              <Star className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">Your Professional PWA Calculator</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className={`text-center ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              <h3 className="font-semibold mb-3">🎉 Features You'll Love:</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  <span>Basic & Scientific Calculator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-green-500" />
                  <span>Unit & Currency Converter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sigma className="w-4 h-4 text-purple-500" />
                  <span>Statistical Calculator</span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span>Works Offline (PWA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-pink-500" />
                  <span>Comprehensive Menu System</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>8 Beautiful Themes</span>
                </div>
              </div>
            </div>
            <div className={`text-center text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              <p className="mb-2">
                💡 <strong>Pro Tip:</strong> Click the menu button (☰) to access all settings!
              </p>
              <p>
                📱 <strong>Install:</strong> Add this app to your home screen for the best experience!
              </p>
            </div>
            <Button
              onClick={() => setShowWelcome(false)}
              className={`w-full bg-gradient-to-r ${currentThemeConfig.primary} text-white hover:opacity-90 border-0 font-medium`}
            >
              Get Started! 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  // Add install function
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        toast({ title: "App Installed!", description: "Calculator Pro+ is now on your device!" })
      }
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  // Add after other useEffects
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== "undefined" && "performance" in window) {
      const loadTime = performance.now()
      console.log(`Calculator loaded in ${loadTime.toFixed(2)}ms`)
    }
  }, [])

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${currentThemeConfig.background}`}>
      <WelcomeDialog />
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Card className={`w-full max-w-lg ${currentThemeConfig.surface} shadow-2xl border-2`}>
          {/* Header with Menu */}
          <CardHeader className={`text-center bg-gradient-to-r ${currentThemeConfig.primary} text-white rounded-t-lg`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-7 h-7" />
                <Star className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-wide">Calculator Pro+</h1>
              <div className="flex items-center gap-2">
                {!isOnline && <WifiOff className="w-5 h-5 text-red-300" />}
                {isOnline && <Wifi className="w-5 h-5 text-green-300" />}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className={isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}
                  >
                    <SheetHeader>
                      <SheetTitle className={isDarkMode ? "text-white" : "text-slate-900"}>Calculator Menu</SheetTitle>
                      <SheetDescription className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                        Access all settings and features
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                      <div className="space-y-6">
                        {/* Theme Settings */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <Palette className="w-4 h-4" />
                            Appearance
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div
                                className={`flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                              >
                                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                <span className="text-sm">Dark Mode</span>
                              </div>
                              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                            </div>
                            <div className="space-y-2">
                              <label
                                className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                              >
                                Theme
                              </label>
                              <Select
                                value={currentTheme.toString()}
                                onValueChange={(value) => setCurrentTheme(Number.parseInt(value))}
                              >
                                <SelectTrigger
                                  className={
                                    isDarkMode
                                      ? "bg-slate-800 border-slate-600 text-white"
                                      : "bg-white border-slate-300 text-slate-900"
                                  }
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                  className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                                >
                                  {(isDarkMode ? darkThemes : themes).map((theme, index) => (
                                    <SelectItem
                                      key={index}
                                      value={index.toString()}
                                      className={
                                        isDarkMode
                                          ? "text-white hover:bg-slate-700"
                                          : "text-slate-900 hover:bg-slate-100"
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.primary}`}></div>
                                        {theme.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* Audio Settings */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <Volume2 className="w-4 h-4" />
                            Audio
                          </h3>
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                            >
                              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                              <span className="text-sm">Sound Effects</span>
                            </div>
                            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* History Management */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <History className="w-4 h-4" />
                            History ({history.length})
                          </h3>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={exportHistory}
                              disabled={history.length === 0}
                              className="w-full justify-start bg-transparent"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export History
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistory([])}
                              disabled={history.length === 0}
                              className="w-full justify-start"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear History
                            </Button>
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* Memory Operations */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <CalcIcon className="w-4 h-4" />
                            Memory: {memoryValue}
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {["MC", "MR", "M+", "M-", "MS"].map((mem) => (
                              <Button
                                key={mem}
                                variant="outline"
                                size="sm"
                                onClick={() => memoryOperation(mem)}
                                className="text-xs"
                              >
                                {mem}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* App Actions */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <Share2 className="w-4 h-4" />
                            Share & Info
                          </h3>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={shareApp}
                              className="w-full justify-start bg-transparent"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share App
                            </Button>
                            {showInstallPrompt && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleInstallApp}
                                className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Install App
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open("https://github.com", "_blank")}
                              className="w-full justify-start"
                            >
                              <Info className="w-4 h-4 mr-2" />
                              About
                            </Button>
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* Keyboard Shortcuts */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <Keyboard className="w-4 h-4" />
                            Keyboard Shortcuts
                          </h3>
                          <div className={`text-xs space-y-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                            <div>0-9: Numbers</div>
                            <div>+, -, *, /: Operations</div>
                            <div>Enter/=: Calculate</div>
                            <div>Escape: Clear All</div>
                            <div>Backspace: Delete</div>
                            <div>%: Percentage</div>
                            <div>^: Power</div>
                            <div>!: Factorial</div>
                          </div>
                        </div>

                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        {/* App Status */}
                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            Status
                          </h3>
                          <div className={`text-sm space-y-1 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            <div className="flex justify-between">
                              <span>Connection:</span>
                              <Badge variant={isOnline ? "default" : "destructive"}>
                                {isOnline ? "Online" : "Offline"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>PWA:</span>
                              <Badge variant="default">Enabled</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Version:</span>
                              <Badge variant="secondary">3.0</Badge>
                            </div>
                          </div>
                        </div>

                        {/* How to Use Guide */}
                        <Separator className={isDarkMode ? "bg-slate-700" : "bg-slate-200"} />

                        <div className="space-y-3">
                          <h3
                            className={`font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            <Info className="w-4 h-4" />
                            How to Use This App
                          </h3>
                          <ScrollArea className="h-60">
                            <div className={`text-xs space-y-4 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                              {/* Calculator Tab Guide */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  🧮 Calculator Tab
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Basic Mode:</strong> Standard arithmetic operations (+, -, ×, ÷)
                                  </p>
                                  <p>
                                    <strong>Scientific Mode:</strong> Advanced functions like sin, cos, tan, log, ln,
                                    etc.
                                  </p>
                                  <p>
                                    <strong>Memory:</strong> MC (clear), MR (recall), M+ (add), M- (subtract), MS
                                    (store)
                                  </p>
                                  <p>
                                    <strong>Special:</strong> x², x³, √, ∛, %, x!, π, e, random numbers
                                  </p>
                                  <p>
                                    <strong>Tip:</strong> Switch between Basic/Scientific using the toggle buttons
                                  </p>
                                </div>
                              </div>

                              {/* Units Tab Guide */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  📏 Units Tab
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Categories:</strong> Length, Weight, Temperature, Area, Volume
                                  </p>
                                  <p>
                                    <strong>How to:</strong> 1) Select category 2) Choose from/to units 3) Enter value
                                    4) Click Convert
                                  </p>
                                  <p>
                                    <strong>Example:</strong> Convert 100 meters to feet, centimeters, etc.
                                  </p>
                                  <p>
                                    <strong>Temperature:</strong> Celsius ↔ Fahrenheit ↔ Kelvin conversions
                                  </p>
                                </div>
                              </div>

                              {/* Currency Tab Guide */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  💱 Money Tab
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Currencies:</strong> USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, KRW
                                  </p>
                                  <p>
                                    <strong>How to:</strong> 1) Select from currency 2) Select to currency 3) Enter
                                    amount 4) Convert
                                  </p>
                                  <p>
                                    <strong>Rates:</strong> Exchange rates shown at bottom (Base: USD)
                                  </p>
                                  <p>
                                    <strong>Note:</strong> Rates are sample values for demo purposes
                                  </p>
                                </div>
                              </div>

                              {/* Statistics Tab Guide */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  📊 Stats Tab
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Add Data:</strong> Enter numbers and click Add (or press Enter)
                                  </p>
                                  <p>
                                    <strong>Calculations:</strong> Mean, Median, Mode, Standard Deviation, Variance
                                  </p>
                                  <p>
                                    <strong>Range:</strong> Min, Max, Sum, Count automatically calculated
                                  </p>
                                  <p>
                                    <strong>Clear:</strong> Use Clear button to reset all statistical data
                                  </p>
                                  <p>
                                    <strong>Use Case:</strong> Perfect for data analysis and statistics homework
                                  </p>
                                </div>
                              </div>

                              {/* Analytics Tab Guide */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  📈 Data Tab
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Usage Stats:</strong> Track your calculation history and patterns
                                  </p>
                                  <p>
                                    <strong>Distribution:</strong> See percentage breakdown of calculation types
                                  </p>
                                  <p>
                                    <strong>Recent Activity:</strong> Last 10 calculations with type badges
                                  </p>
                                  <p>
                                    <strong>Progress:</strong> Visual progress bars show your usage patterns
                                  </p>
                                </div>
                              </div>

                              {/* Keyboard Shortcuts */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  ⌨️ Keyboard Shortcuts
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Numbers:</strong> 0-9 for digits, . for decimal
                                  </p>
                                  <p>
                                    <strong>Operations:</strong> +, -, *, / for basic math
                                  </p>
                                  <p>
                                    <strong>Execute:</strong> Enter or = to calculate
                                  </p>
                                  <p>
                                    <strong>Clear:</strong> Escape for clear all, Backspace to delete last
                                  </p>
                                  <p>
                                    <strong>Special:</strong> % for percent, ^ for power, ! for factorial
                                  </p>
                                </div>
                              </div>

                              {/* PWA Features */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  📱 PWA Features
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Offline:</strong> Works completely offline after first load
                                  </p>
                                  <p>
                                    <strong>Install:</strong> Add to home screen like a native app
                                  </p>
                                  <p>
                                    <strong>Themes:</strong> 8 beautiful color themes + dark/light modes
                                  </p>
                                  <p>
                                    <strong>History:</strong> All calculations saved automatically
                                  </p>
                                  <p>
                                    <strong>Export:</strong> Download calculation history as text file
                                  </p>
                                </div>
                              </div>

                              {/* Tips & Tricks */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  💡 Pro Tips
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Precision:</strong> Results accurate to 15 significant digits
                                  </p>
                                  <p>
                                    <strong>Memory:</strong> Store frequently used numbers in memory
                                  </p>
                                  <p>
                                    <strong>Parentheses:</strong> Use () for complex expressions
                                  </p>
                                  <p>
                                    <strong>Scientific:</strong> Functions work in radians by default
                                  </p>
                                  <p>
                                    <strong>Sounds:</strong> Enable audio feedback in settings
                                  </p>
                                  <p>
                                    <strong>Share:</strong> Share app with friends using share button
                                  </p>
                                </div>
                              </div>

                              {/* Troubleshooting */}
                              <div className="space-y-2">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  🔧 Troubleshooting
                                </h4>
                                <div className="space-y-1">
                                  <p>
                                    <strong>Error Display:</strong> Check your expression for syntax errors
                                  </p>
                                  <p>
                                    <strong>Large Numbers:</strong> Very large results shown in scientific notation
                                  </p>
                                  <p>
                                    <strong>Domain Errors:</strong> Some functions have input restrictions (e.g., √-1)
                                  </p>
                                  <p>
                                    <strong>Refresh:</strong> Use refresh button if app becomes unresponsive
                                  </p>
                                  <p>
                                    <strong>Storage:</strong> History and settings saved in browser storage
                                  </p>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <p className="text-sm opacity-90 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Professional Multi-Function Calculator with PWA
            </p>
          </CardHeader>

          {/* Display */}
          <CardContent className={`p-6 ${isDarkMode ? "bg-slate-900/50" : "bg-slate-50"}`}>
            <div
              className={`text-right mb-3 h-8 text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"} overflow-hidden`}
            >
              {previousExpression}
            </div>
            <div
              className={`text-right text-5xl font-bold h-16 ${isDarkMode ? "text-white" : "text-slate-900"} overflow-hidden break-all`}
            >
              {currentExpression}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Badge
                variant="secondary"
                className={`bg-gradient-to-r ${currentThemeConfig.accent} text-white border-0`}
              >
                Memory: {memoryValue}
              </Badge>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${isDarkMode ? "border-slate-600 text-slate-300" : "border-slate-300 text-slate-700"}`}
                >
                  {isScientificMode ? "Scientific" : "Basic"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${isDarkMode ? "border-slate-600 text-slate-300" : "border-slate-300 text-slate-700"}`}
                >
                  {isDarkMode ? "Dark" : "Light"}
                </Badge>
                <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </CardContent>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-5 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"} m-4 mb-0`}>
              <TabsTrigger
                value="calculator"
                className={`flex items-center gap-1 ${isDarkMode ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300" : "data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600"}`}
              >
                <Calculator className="w-4 h-4" />
                Calc
              </TabsTrigger>
              <TabsTrigger
                value="units"
                className={`flex items-center gap-1 ${isDarkMode ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300" : "data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600"}`}
              >
                <Ruler className="w-4 h-4" />
                Units
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className={`flex items-center gap-1 ${isDarkMode ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300" : "data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600"}`}
              >
                <DollarSign className="w-4 h-4" />
                Money
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className={`flex items-center gap-1 ${isDarkMode ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300" : "data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600"}`}
              >
                <Sigma className="w-4 h-4" />
                Stats
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className={`flex items-center gap-1 ${isDarkMode ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300" : "data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600"}`}
              >
                <BarChart3 className="w-4 h-4" />
                Data
              </TabsTrigger>
            </TabsList>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="p-6 pt-4">
              {/* Mode Toggle */}
              <div className="mb-4">
                <div className={`flex ${isDarkMode ? "bg-slate-800" : "bg-slate-100"} rounded-lg p-1`}>
                  <Button
                    variant={!isScientificMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsScientificMode(false)}
                    className={`flex-1 ${!isScientificMode ? `bg-gradient-to-r ${currentThemeConfig.primary} text-white border-0` : isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    Basic
                  </Button>
                  <Button
                    variant={isScientificMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsScientificMode(true)}
                    className={`flex-1 ${isScientificMode ? `bg-gradient-to-r ${currentThemeConfig.primary} text-white border-0` : isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    Scientific
                  </Button>
                </div>
              </div>

              {/* Enhanced Scientific Functions */}
              {isScientificMode && (
                <div className="mb-4">
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {[
                      { label: "sin", func: "sin" },
                      { label: "cos", func: "cos" },
                      { label: "tan", func: "tan" },
                      { label: "log", func: "log" },
                      { label: "ln", func: "ln" },
                      { label: "log₂", func: "log2" },
                      { label: "sin⁻¹", func: "asin" },
                      { label: "cos⁻¹", func: "acos" },
                      { label: "tan⁻¹", func: "atan" },
                      { label: "10ˣ", func: "pow10" },
                      { label: "2ˣ", func: "exp2" },
                      { label: "eˣ", func: "exp" },
                      { label: "sinh", func: "sinh" },
                      { label: "cosh", func: "cosh" },
                      { label: "tanh", func: "tanh" },
                      { label: "π", func: "pi" },
                      { label: "e", func: "e" },
                      { label: "rand", func: "random" },
                      { label: "x³", func: "cube" },
                      { label: "∛x", func: "cbrt" },
                      { label: "xʸ", func: "pow" },
                      { label: "|x|", func: "abs" },
                      { label: "1/x", func: "reciprocal" },
                      { label: "±", func: "negate" },
                      { label: "⌊x⌋", func: "floor" },
                      { label: "⌈x⌉", func: "ceil" },
                      { label: "round", func: "round" },
                      { label: "deg", func: "deg" },
                      { label: "rad", func: "rad" },
                      { label: "x!", func: "factorial" },
                    ].map((btn) => (
                      <Button
                        key={btn.func}
                        variant="secondary"
                        size="sm"
                        onClick={() => calculateFunction(btn.func)}
                        className={`text-xs h-10 bg-gradient-to-r ${currentThemeConfig.accent} text-white hover:opacity-90 border-0 font-medium`}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculator Buttons */}
              <div className="space-y-2">
                {/* Memory and Clear Row */}
                <div className="grid grid-cols-6 gap-2">
                  {["MC", "MR", "M+", "M-", "MS"].map((mem) => (
                    <Button
                      key={mem}
                      variant="secondary"
                      size="sm"
                      onClick={() => memoryOperation(mem)}
                      className={`h-12 bg-gradient-to-r ${currentThemeConfig.secondary} text-white hover:opacity-90 border-0 font-medium`}
                    >
                      {mem}
                    </Button>
                  ))}
                  <Button variant="destructive" size="sm" onClick={clearAll} className="h-12 font-medium">
                    AC
                  </Button>
                </div>

                {/* Function Row */}
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression("(")}
                    className={`h-12 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    (
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression(")")}
                    className={`h-12 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    )
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => calculateFunction("factorial")}
                    className={`h-12 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    x!
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression("÷")}
                    className="h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 border-0 font-medium"
                  >
                    ÷
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={deleteLast}
                    className={`h-12 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    ⌫
                  </Button>
                </div>

                {/* Number Rows */}
                {[
                  [
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                    { label: "9", value: "9" },
                    { label: "×", value: "×", operator: true },
                    { label: "x²", func: "square" },
                  ],
                  [
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
                    { label: "6", value: "6" },
                    { label: "−", value: "−", operator: true },
                    { label: "√", func: "sqrt" },
                  ],
                  [
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "+", value: "+", operator: true },
                    { label: "%", func: "percent" },
                  ],
                ].map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-5 gap-2">
                    {row.map((btn, btnIndex) => (
                      <Button
                        key={btnIndex}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (btn.value) updateExpression(btn.value)
                          if (btn.func) calculateFunction(btn.func)
                        }}
                        className={`h-12 border-0 font-medium ${
                          btn.operator
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                            : btn.func
                              ? "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:opacity-90"
                              : isDarkMode
                                ? "bg-slate-700 text-white hover:bg-slate-600"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                        }`}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                ))}

                {/* Bottom Row */}
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression("0")}
                    className={`h-12 col-span-2 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    0
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression(".")}
                    className={`h-12 ${isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"} border-0 font-medium`}
                  >
                    .
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={calculateResult}
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 border-0 font-medium"
                  >
                    =
                  </Button>
                </div>

                {/* Special Functions */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => calculateFunction("random")}
                    className={`h-10 bg-gradient-to-r ${currentThemeConfig.accent} text-white hover:opacity-90 border-0 font-medium`}
                  >
                    Random
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression("π")}
                    className={`h-10 bg-gradient-to-r ${currentThemeConfig.accent} text-white hover:opacity-90 border-0 font-medium`}
                  >
                    π
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateExpression("e")}
                    className={`h-10 bg-gradient-to-r ${currentThemeConfig.accent} text-white hover:opacity-90 border-0 font-medium`}
                  >
                    e
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Unit Converter Tab */}
            <TabsContent value="units" className="p-6 pt-4">
              <div className="space-y-4">
                <div>
                  <label
                    className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Category
                  </label>
                  <Select value={unitCategory} onValueChange={setUnitCategory}>
                    <SelectTrigger
                      className={
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                    >
                      {Object.entries(unitConversions).map(([key, category]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className={isDarkMode ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"}
                        >
                          <div className="flex items-center gap-2">
                            {key === "length" && <Ruler className="w-4 h-4" />}
                            {key === "temperature" && <Thermometer className="w-4 h-4" />}
                            {key === "weight" && <TrendingUp className="w-4 h-4" />}
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      From
                    </label>
                    <Select value={unitFrom} onValueChange={setUnitFrom}>
                      <SelectTrigger
                        className={
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                      >
                        {Object.entries(unitConversions[unitCategory as keyof typeof unitConversions].units as any).map(
                          ([unit, data]) => (
                            <SelectItem
                              key={unit}
                              value={unit}
                              className={
                                isDarkMode ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                              }
                            >
                              {data.name || unit.toUpperCase()}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      To
                    </label>
                    <Select value={unitTo} onValueChange={setUnitTo}>
                      <SelectTrigger
                        className={
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                      >
                        {Object.entries(unitConversions[unitCategory as keyof typeof unitConversions].units as any).map(
                          ([unit, data]) => (
                            <SelectItem
                              key={unit}
                              value={unit}
                              className={
                                isDarkMode ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                              }
                            >
                              {data.name || unit.toUpperCase()}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Value
                  </label>
                  <input
                    type="number"
                    value={unitValue}
                    onChange={(e) => setUnitValue(e.target.value)}
                    className={`w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                    }`}
                    placeholder="Enter value to convert"
                  />
                </div>

                <Button
                  onClick={convertUnit}
                  className={`w-full h-12 bg-gradient-to-r ${currentThemeConfig.primary} text-white hover:opacity-90 border-0 font-medium`}
                >
                  Convert
                </Button>
              </div>
            </TabsContent>

            {/* Currency Converter Tab */}
            <TabsContent value="currency" className="p-6 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      From Currency
                    </label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger
                        className={
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                      >
                        {Object.entries(currencies).map(([currency, data]) => (
                          <SelectItem
                            key={currency}
                            value={currency}
                            className={
                              isDarkMode ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                            }
                          >
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {currency} - {data.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      To Currency
                    </label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger
                        className={
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}
                      >
                        {Object.entries(currencies).map(([currency, data]) => (
                          <SelectItem
                            key={currency}
                            value={currency}
                            className={
                              isDarkMode ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                            }
                          >
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {currency} - {data.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    value={currencyAmount}
                    onChange={(e) => setCurrencyAmount(e.target.value)}
                    className={`w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                    }`}
                    placeholder="Enter amount to convert"
                  />
                </div>

                <Button
                  onClick={convertCurrency}
                  className={`w-full h-12 bg-gradient-to-r ${currentThemeConfig.primary} text-white hover:opacity-90 border-0 font-medium`}
                >
                  Convert Currency
                </Button>

                <Card
                  className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                >
                  <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Exchange Rates (Base: USD)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(currencies).map(([currency, data]) => (
                      <div
                        key={currency}
                        className={`flex justify-between ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <span>{currency}:</span>
                        <span>{data.rate}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Statistical Calculator Tab */}
            <TabsContent value="statistics" className="p-6 pt-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3
                    className={`text-lg font-semibold mb-4 flex items-center justify-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    <Sigma className="w-5 h-5" />
                    Statistical Calculator
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      className={`text-sm font-medium mb-2 block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      Add Data Point
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={statInput}
                        onChange={(e) => setStatInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addStatisticalValue()}
                        className={`flex-1 p-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                        }`}
                        placeholder="Enter number"
                      />
                      <Button
                        onClick={addStatisticalValue}
                        className={`bg-gradient-to-r ${currentThemeConfig.primary} text-white hover:opacity-90 border-0`}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {statisticalData.values.length > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                          Data Points ({statisticalData.count})
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearStatisticalData}
                          className="text-xs bg-transparent"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                      >
                        <div
                          className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"} max-h-20 overflow-y-auto`}
                        >
                          {statisticalData.values.join(", ")}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-500">{statisticalData.mean?.toFixed(4)}</div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Mean</div>
                          </div>
                        </Card>
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-500">{statisticalData.median?.toFixed(4)}</div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Median</div>
                          </div>
                        </Card>
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-500">
                              {statisticalData.stdDev?.toFixed(4)}
                            </div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Std Dev</div>
                          </div>
                        </Card>
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-500">
                              {statisticalData.variance?.toFixed(4)}
                            </div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                              Variance
                            </div>
                          </div>
                        </Card>
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-500">{statisticalData.min}</div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Minimum</div>
                          </div>
                        </Card>
                        <Card
                          className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-teal-500">{statisticalData.max}</div>
                            <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Maximum</div>
                          </div>
                        </Card>
                      </div>

                      <Card
                        className={`p-3 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                      >
                        <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          Additional Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className={`flex justify-between ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            <span>Sum:</span>
                            <span>{statisticalData.sum?.toFixed(4)}</span>
                          </div>
                          <div className={`flex justify-between ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            <span>Count:</span>
                            <span>{statisticalData.count}</span>
                          </div>
                          <div className={`flex justify-between ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            <span>Range:</span>
                            <span>{((statisticalData.max || 0) - (statisticalData.min || 0)).toFixed(4)}</span>
                          </div>
                          <div className={`flex justify-between ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            <span>Mode:</span>
                            <span>
                              {statisticalData.mode?.length === 0 ? "None" : statisticalData.mode?.join(", ")}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </>
                  )}

                  {statisticalData.values.length === 0 && (
                    <div className={`text-center py-8 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      <Sigma className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No data points yet</p>
                      <p className="text-sm">Add numbers to calculate statistics</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6 pt-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3
                    className={`text-lg font-semibold mb-4 flex items-center justify-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Usage Analytics
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
                      <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Total Calculations
                      </div>
                    </div>
                  </Card>
                  <Card
                    className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{stats.scientific}</div>
                      <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Scientific Functions
                      </div>
                    </div>
                  </Card>
                  <Card
                    className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">{stats.unit}</div>
                      <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Unit Conversions
                      </div>
                    </div>
                  </Card>
                  <Card
                    className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">{stats.currency}</div>
                      <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Currency Conversions
                      </div>
                    </div>
                  </Card>
                </div>

                <Card
                  className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                >
                  <h4
                    className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Usage Distribution
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        Basic Calculations
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.basicPercent} className="w-20" />
                        <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {stats.basicPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        Scientific Functions
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.scientificPercent} className="w-20" />
                        <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {stats.scientificPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>Conversions</span>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.conversionPercent} className="w-20" />
                        <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {stats.conversionPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>Statistical</span>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.statisticalPercent} className="w-20" />
                        <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {stats.statisticalPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
                >
                  <h4
                    className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item, index) => (
                        <div key={index} className="text-xs flex justify-between items-center">
                          <span className={`truncate flex-1 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            {item.expression} = {item.result}
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-2 text-xs ${
                              item.type === "basic"
                                ? "border-blue-500 text-blue-500"
                                : item.type === "scientific"
                                  ? "border-green-500 text-green-500"
                                  : item.type === "unit"
                                    ? "border-purple-500 text-purple-500"
                                    : item.type === "statistical"
                                      ? "border-pink-500 text-pink-500"
                                      : "border-orange-500 text-orange-500"
                            }`}
                          >
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <div className={`text-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          No recent activity
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <Separator className={isDarkMode ? "bg-slate-600" : "bg-slate-300"} />
          <div className={`p-6 text-center ${isDarkMode ? "bg-slate-900/30" : "bg-slate-50"}`}>
            <p className={`text-sm mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Created with ❤️ by Subhash Adak
            </p>
            <div className="flex justify-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareApp}
                className={
                  isDarkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("https://github.com", "_blank")}
                className={
                  isDarkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }
              >
                <Download className="w-4 h-4 mr-1" />
                Source
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className={
                  isDarkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            <div className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
              Version 3.0 • PWA Calculator with Offline Support
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
