import $axios from "@/utils/http";

// ========== 数据结构 ==========

/** 产品分页查询参数 */
export interface ProductQuery {
  pageNum?: number
  pageSize?: number
  productName?: string
  category?: string
  certId?: number
  status?: number
}

/** 产品列表查询参数（不分页） */
export interface ProductListQuery {
  productName?: string
  category?: string
  status?: number
}

/** 产品分类查询参数 */
export interface ProductCategoryQuery {
  category: string
}

/** 产品列表响应 */
export interface ProductPageVO {
  records: ProductVO[]
  total: number
  size: number
  current: number
  pages: number
}

/** 产品视图对象 */
export interface ProductVO {
  id: number
  productCode: string
  productName: string
  category?: string
  categoryName?: string
  spec?: string[]
  certId?: number
  certCode?: string
  material?: string
  colorOptions?: string
  price?: number
  imageUrl?: string
  status: number
  statusName: string
  remark?: string
  createTime?: string
  createBy?: number
}

/** 创建产品请求 */
export interface CreateProductDTO {
  productName: string
  category?: string
  categoryName?: string
  spec?: string
  certId?: number
  material?: string
  colorOptions?: string
  price?: number
  imageUrl?: string
  remark?: string
}

/** 更新产品请求 */
export interface UpdateProductDTO {
  productName?: string
  category?: string
  categoryName?: string
  spec?: string
  certId?: number
  material?: string
  colorOptions?: string
  price?: number
  imageUrl?: string
  status?: number
  remark?: string
}

// ========== API ==========

/**
 * 分页查询产品列表
 * POST /basic/product/page
 */
export async function productPage(params: ProductQuery): Promise<ProductPageVO> {
  const res: any = await $axios('/basic/product/page', { method: 'post', data: params })
  return res as ProductPageVO
}

/**
 * 查询所有产品列表（不分页）
 * POST /basic/product/list
 */
export async function productList(params: ProductListQuery): Promise<ProductVO[]> {
  const res: any = await $axios('/basic/product/list', { method: 'post', data: params })
  return res as ProductVO[]
}

/**
 * 根据ID查询产品详情
 * GET /basic/product/{id}
 */
export async function productDetail(id: number): Promise<ProductVO> {
  const res: any = await $axios(`/basic/product/${id}`, { method: 'get' })
  return res as ProductVO
}

/**
 * 创建产品
 * POST /basic/product
 */
export function productCreate(data: CreateProductDTO) {
  return $axios('/basic/product', { method: 'post', data })
}

/**
 * 更新产品
 * PUT /basic/product/{id}
 */
export function productUpdate(id: number, data: UpdateProductDTO) {
  return $axios(`/basic/product/${id}`, { method: 'put', data })
}

/**
 * 删除产品
 * DELETE /basic/product/{id}
 */
export function productDelete(id: number) {
  return $axios(`/basic/product/${id}`, { method: 'delete' })
}

/**
 * 按注册证查询产品列表（不分页）
 * GET /basic/product/list-by-cert/{certId}
 */
export async function productListByCert(certId: number): Promise<ProductVO[]> {
  const res: any = await $axios(`/basic/product/list-by-cert/${certId}`, { method: 'get' })
  return res as ProductVO[]
}

/**
 * 按分类查询产品列表（不分页）
 * POST /basic/product/list-by-category
 */
export async function productListByCategory(params: ProductCategoryQuery): Promise<ProductVO[]> {
  const res: any = await $axios('/basic/product/list-by-category', { method: 'post', data: params })
  return res as ProductVO[]
}

// ========== 产品规格 API ==========

/** 产品规格视图对象 */
export interface ProductSpecVO {
  id: number
  productId: number
  specName: string
  certId?: number
  certNo?: string
  sort?: number
  status: number
  statusName: string
  remark?: string
  createTime?: string
  createBy?: number
}

/** 创建产品规格请求 */
export interface CreateProductSpecDTO {
  specName: string
  certId?: number
  sort?: number
  status?: number
  remark?: string
}

/** 更新产品规格请求 */
export interface UpdateProductSpecDTO {
  specName?: string
  certId?: number
  sort?: number
  status?: number
  remark?: string
}

/** 创建产品规格
 * POST /basic/product/{id}/spec
 */
export function productSpecCreate(productId: number, data: CreateProductSpecDTO) {
  return $axios(`/basic/product/${productId}/spec`, { method: 'post', data })
}

/** 查询产品规格列表
 * GET /basic/product/{id}/specs
 */
export async function productSpecList(productId: number): Promise<ProductSpecVO[]> {
  const res: any = await $axios(`/basic/product/${productId}/specs`, { method: 'get' })
  return res as ProductSpecVO[]
}

/** 更新产品规格
 * PUT /basic/product/spec/{specId}
 */
export function productSpecUpdate(specId: number, data: UpdateProductSpecDTO) {
  return $axios(`/basic/product/spec/${specId}`, { method: 'put', data })
}

/** 删除产品规格
 * DELETE /basic/product/spec/{specId}
 */
export function productSpecDelete(specId: number) {
  return $axios(`/basic/product/spec/${specId}`, { method: 'delete' })
}