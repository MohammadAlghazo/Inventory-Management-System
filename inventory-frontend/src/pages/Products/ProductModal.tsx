import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { productsApi } from '../../api/services'
import { useToastStore } from '../../store'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be >= 0'),
  minQuantity: z.coerce.number().int().min(0, 'Min quantity must be >= 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  unit: z.string().optional().default('piece'),
  imageUrl: z.string().optional().default(''),
  supplier: z.string().optional().default('')
})

type FormData = z.infer<typeof schema>

interface Props {
  product?: any
  onClose: () => void
}

const UNITS = ['piece', 'kg', 'liter', 'box', 'meter', 'pack', 'ton']

export default function ProductModal({ product, onClose }: Props) {
  const { t } = useTranslation()
  const { addToast } = useToastStore()
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku || '',
          price: product.price,
          quantity: product.quantity,
          minQuantity: product.minQuantity,
          category: product.category,
          description: product.description || '',
          unit: product.unit || 'piece',
          imageUrl: product.imageUrl || '',
          supplier: product.supplier || ''
        }
      : {
          unit: 'piece',
          price: 0,
          quantity: 0,
          minQuantity: 0
        }
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      product
        ? productsApi.update(product.id, data)
        : productsApi.create(data),
    onSuccess: () => {
      addToast('success', product ? 'Product updated successfully' : 'Product created successfully')
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product-categories'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onClose()
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Failed to save product')
    }
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {product ? t('editProduct') : t('addProduct')}
          </h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('productName')} *</label>
                <input className="form-input" {...register('name')} />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('sku')}</label>
                <input className="form-input" {...register('sku')} placeholder="AUTO-001" />
              </div>

              <div className="form-group">
                <label className="form-label">{t('price')} ($) *</label>
                <input className="form-input" type="number" step="0.01" {...register('price')} />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('category')} *</label>
                <input className="form-input" {...register('category')} placeholder="Electronics, Food..." />
                {errors.category && <span className="form-error">{errors.category.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('quantity')} *</label>
                <input className="form-input" type="number" {...register('quantity')} />
                {errors.quantity && <span className="form-error">{errors.quantity.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('minQuantity')} *</label>
                <input className="form-input" type="number" {...register('minQuantity')} />
                {errors.minQuantity && <span className="form-error">{errors.minQuantity.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('unit')}</label>
                <select className="form-select" {...register('unit')}>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{t(u as any)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('supplier')}</label>
                <input className="form-input" {...register('supplier')} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">{t('description')}</label>
              <textarea className="form-textarea" rows={3} {...register('description')} />
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">{t('imageUrl')}</label>
              <input className="form-input" type="url" {...register('imageUrl')} placeholder="https://..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) ? (
                <><span className="spinner" /> {t('saving')}</>
              ) : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
