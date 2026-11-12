import { useEffect, useRef, useState } from 'react'
import { claimCrateRequest } from '../api/crateClaimApi.js'

export function useCrateClaim(initialDrops) {
  const [drops, setDrops] = useState(initialDrops)
  const [alertMessage, setAlertMessage] = useState('')
  const controllersRef = useRef(new Set())

  useEffect(() => {
    const controllers = controllersRef.current
    return () => {
      controllers.forEach((controller) => controller.abort())
      controllers.clear()
    }
  }, [])

  const changeStock = (dropId, delta) => {
    setDrops((prev) =>
      prev.map((drop) =>
        drop.id === dropId ? { ...drop, remainingStock: drop.remainingStock + delta } : drop,
      ),
    )
  }

  const claim = async (dropId) => {
    const controller = new AbortController()
    controllersRef.current.add(controller)
    changeStock(dropId, -1)
    setAlertMessage('')

    try {
      const response = await claimCrateRequest(dropId, { signal: controller.signal })
      if (response.status === 409) {
        changeStock(dropId, 1)
        setAlertMessage('Crate đã bị squad khác loot trước, số lượng đã được hoàn lại.')
        return
      }
      if (!response.ok) throw new Error(`Claim failed with status ${response.status}`)
    } catch (err) {
      if (err.name === 'AbortError') return
      changeStock(dropId, 1)
      setAlertMessage('Không thể claim lúc này, vui lòng thử lại.')
    } finally {
      controllersRef.current.delete(controller)
    }
  }

  return { drops, claim, alertMessage }
}
