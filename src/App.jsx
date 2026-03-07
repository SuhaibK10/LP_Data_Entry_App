/**
 * @file App.jsx
 * @description Root application component.
 *
 * Flow:
 *   splash → welcome → step1 (Name) → step2 (Rendered Photos ×3)
 *   → step3 (Pack Front) → step4 (Pack Barcode) → step5 (Pack Back)
 *   → step6 (Specs) → review → submit → success
 */

import { useState, useEffect } from 'react'

import Grain from './components/Grain'
import Splash from './components/Splash'
import WelcomeScreen from './components/WelcomeScreen'
import StepProductInfo from './components/StepProductInfo'
import PhotoStep from './components/PhotoStep'
import StepSpecs from './components/StepSpecs'
import ReviewScreen from './components/ReviewScreen'
import SubmittingScreen from './components/SubmittingScreen'
import SuccessScreen from './components/SuccessScreen'
import ProductListScreen from './components/ProductListScreen'
import FloatingMenu from './components/FloatingMenu'

import { uploadPhoto, submitToSheets, updateInSheets, fetchProducts } from './api'
import { TOTAL_STEPS, MAX_RENDERED_PHOTOS } from './config'
import { productToFormData, normalizeFrontPhotos } from './utils/helpers'


export default function App() {
  const [phase, setPhase]           = useState("welcome")
  const [data, setData]             = useState({})
  const [submitState, setSubmitState] = useState({ status: "", message: "" })
  const [editMode, setEditMode]     = useState(null)
  const [existingProducts, setExistingProducts] = useState([])

  const loadProductsForDuplicateCheck = () => {
    fetchProducts()
      .then(products => setExistingProducts(products))
      .catch(() => {})
  }

  useEffect(() => { loadProductsForDuplicateCheck() }, [])

  const update = (partial) => setData(prev => ({ ...prev, ...partial }))


  // ── Submit ──

  const handleSubmit = async () => {
    setPhase("submitting")

    try {
      // 1. Upload rendered photos (array, up to 3)
      const renderedPhotos = normalizeFrontPhotos(data.renderedPhotos)
      const renderedUrls = []
      for (let i = 0; i < renderedPhotos.length; i++) {
        setSubmitState({ status: "uploading", message: `Uploading rendered photo ${i + 1} of ${renderedPhotos.length}...` })
        const url = await uploadPhoto(renderedPhotos[i])
        if (url) renderedUrls.push(url)
      }

      // 2. Upload pack front
      setSubmitState({ status: "uploading", message: "Uploading packaging front..." })
      const packFrontUrl = await uploadPhoto(data.packFront)

      // 3. Upload pack barcode
      setSubmitState({ status: "uploading", message: "Uploading barcode photo..." })
      const packBarcodeUrl = await uploadPhoto(data.packBarcode)

      // 4. Upload pack back
      setSubmitState({ status: "uploading", message: "Uploading packaging back..." })
      const packBackUrl = await uploadPhoto(data.packBack)

      // 5. Save to sheet
      setSubmitState({ status: "uploading", message: "Saving to sheet..." })

      const payload = {
        timestamp:         new Date().toISOString(),
        productName:       data.productName || "",
        mrp:               data.mrp || "",
        netWeight:         data.netWeight || "",
        grossWeight:       data.grossWeight || "",
        renderedPhotoUrls: renderedUrls.join(", "),
        packFrontUrl:      packFrontUrl || "",
        packBarcodeUrl:    packBarcodeUrl || "",
        packBackUrl:       packBackUrl || "",
      }

      if (editMode) {
        updateInSheets({ ...payload, rowNumber: editMode.rowNumber })
      } else {
        submitToSheets(payload)
      }

      setPhase("success")
      loadProductsForDuplicateCheck()

    } catch (err) {
      console.error("[App] Submit error:", err)
      setSubmitState({
        status: "error",
        message: "Failed: " + err.message + ". Please try again.",
      })
      setTimeout(() => setPhase("review"), 3000)
    }
  }


  // ── Navigation ──

  const resetForm = () => {
    setData({})
    setSubmitState({ status: "", message: "" })
    setEditMode(null)
    setPhase("welcome")
  }

  const startEdit = (product) => {
    setData(productToFormData(product))
    setEditMode({ rowNumber: product.rowNumber })
    setPhase("step1")
  }

  const handleRenderedPhotos = (valueOrUpdater) => {
    if (typeof valueOrUpdater === "function") {
      setData(prev => ({ ...prev, renderedPhotos: valueOrUpdater(prev.renderedPhotos) }))
    } else {
      update({ renderedPhotos: valueOrUpdater })
    }
  }

  const showMenu = !["splash", "submitting"].includes(phase)

  return (
    <div>
      <Grain />

      <FloatingMenu
        visible={showMenu}
        onViewProducts={() => { setEditMode(null); setPhase("products") }}
        onNewProduct={resetForm}
      />

      {phase === "splash" && (
        <Splash onDone={() => setPhase("welcome")} />
      )}

      {phase === "welcome" && (
        <WelcomeScreen
          onStart={() => { setEditMode(null); setData({}); setPhase("step1") }}
          onViewProducts={() => setPhase("products")}
        />
      )}

      {phase === "products" && (
        <ProductListScreen
          onBack={() => setPhase("welcome")}
          onEdit={startEdit}
        />
      )}

      {/* Step 1: Product Name */}
      {phase === "step1" && (
        <StepProductInfo
          data={data}
          onChange={update}
          onNext={() => setPhase("step2")}
          onBack={() => editMode ? setPhase("products") : setPhase("welcome")}
          existingProducts={existingProducts}
          isEdit={!!editMode}
        />
      )}

      {/* Step 2: Product Rendered Photos (up to 3) */}
      {phase === "step2" && (
        <PhotoStep
          title={editMode ? "Rendered photos" : "Product\nrendered photos"}
          subtitle="Upload up to 3 hero product images used for listings and catalogues"
          photo={data.renderedPhotos}
          onPhoto={handleRenderedPhotos}
          onNext={() => setPhase("step3")}
          onBack={() => setPhase("step1")}
          stepNum={2}
          totalSteps={TOTAL_STEPS}
          maxPhotos={MAX_RENDERED_PHOTOS}
        />
      )}

      {/* Step 3: Packaging Front */}
      {phase === "step3" && (
        <PhotoStep
          title={editMode ? "Packaging front" : "Upload packaging\nphoto (Front)"}
          subtitle="Front face of the product packaging"
          photo={data.packFront}
          onPhoto={(p) => update({ packFront: p })}
          onNext={() => setPhase("step4")}
          onBack={() => setPhase("step2")}
          stepNum={3}
          totalSteps={TOTAL_STEPS}
        />
      )}

      {/* Step 4: Packaging Back */}
      {phase === "step4" && (
        <PhotoStep
          title={editMode ? "Packaging back" : "Upload packaging\nphoto (Back)"}
          subtitle="Back face of the product packaging"
          photo={data.packBack}
          onPhoto={(p) => update({ packBack: p })}
          onNext={() => setPhase("step5")}
          onBack={() => setPhase("step3")}
          stepNum={4}
          totalSteps={TOTAL_STEPS}
        />
      )}

      {/* Step 5: Packaging Barcode Side */}
      {phase === "step5" && (
        <PhotoStep
          title={editMode ? "Barcode side" : "Upload packaging\nphoto (Barcode)"}
          subtitle="Make sure the barcode and product details are clearly visible"
          photo={data.packBarcode}
          onPhoto={(p) => update({ packBarcode: p })}
          onNext={() => setPhase("step6")}
          onBack={() => setPhase("step4")}
          stepNum={5}
          totalSteps={TOTAL_STEPS}
        />
      )}

      {/* Step 6: Specs */}
      {phase === "step6" && (
        <StepSpecs
          data={data}
          onChange={update}
          onNext={() => setPhase("review")}
          onBack={() => setPhase("step5")}
        />
      )}

      {phase === "review" && (
        <ReviewScreen
          data={data}
          onSubmit={handleSubmit}
          onBack={() => setPhase("step6")}
          isEdit={!!editMode}
        />
      )}

      {phase === "submitting" && (
        <SubmittingScreen
          status={submitState.status}
          message={submitState.message}
        />
      )}

      {phase === "success" && (
        <SuccessScreen
          productName={data.productName}
          onNew={resetForm}
          isEdit={!!editMode}
        />
      )}
    </div>
  )
}
