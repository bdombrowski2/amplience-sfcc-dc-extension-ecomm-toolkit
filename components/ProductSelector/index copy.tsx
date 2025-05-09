import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
    Autocomplete,
    TextField,
    Typography,
    Dialog,
    Card,
    CardContent,
    Backdrop,
    CircularProgress,
    IconButton,
    ImageList,
    Pagination,
    Tabs,
    Tab,
    Box,
    PaginationItem,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search'
import ProductTile from '../ProductTile'
import SortableList from '../SortableList'
import { AmpSDKProps } from '../../lib/models/treeItemData'
import { isEqual } from 'lodash'

import { PageCache, Product } from '@amplience/dc-integration-middleware'
import { Utils } from '../../lib/util'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

const PaginationTheme = createTheme({
    palette:{
        primary:{
          main: '#ecf1fc',
          light: '#ecf1fc',
          dark: '#b4bef2'
        }
      }
})

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    )
}

const ProductSelector: React.FC<AmpSDKProps> = ({ ampSDK }) => {
    const [storedValue] = useState(ampSDK.getStoredValue())
    const [mode, setMode] = useState(0)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingResults, setLoadingResults] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [results, setResults] = useState([])
    const [lastValue, setLastValue] = useState()
    const [selectedProducts, setSelectedProducts] = useState([])
    const keywordInput = useRef(null)
    const container = useRef(null)
    const [height, setHeight] = useState(200)

    const itemsPerPage = 12
    const [loadedPage, setLoadedPage] = React.useState(1)

    const [requestInfo] = useState({ id: 0 })

    const showError = (error) => {
        setAlertMessage(Utils.errorToString(error));
        setShowAlert(true);
    }

    const tabChange = (event: React.SyntheticEvent, newValue: number) => {
        setMode(newValue)
    }

    const setPageWithCache = (cache: PageCache<Product>, pageNum: number) => {
        setLoadingResults(true)
        const requestId = ++requestInfo.id

        cache.getPage(pageNum - 1).then(result => {
            if (requestId !== requestInfo.id) {
                // Request cancelled.
                return;
            }

            result = result.filter(Boolean)

            setResults(result)
            setLoadingResults(false)
            setLoadedPage(pageNum)
        })
        .catch((e) => {
            setLoadingResults(false)
        })
    }

    const searchByCategory = async (category: string) => {
        setResults([])
        if (category !== '') {
            try {
                const cache = new PageCache<Product>(ampSDK.commerceApi.getProducts.bind(ampSDK.commerceApi), {
                    category
                } as any, itemsPerPage)

                setPageWithCache(cache, 1)
            } catch(e) {
                showError(e)
            }
        }
    }

    const searchByKeyword = async () => {
        setResults([])
        if (keywordInput.current.value !== '') {
            try {
                const cache = new PageCache<Product>(ampSDK.commerceApi.getProducts.bind(ampSDK.commerceApi), {
                    productIds: keywordInput.current.value
                } as any, itemsPerPage)

                setPageWithCache(cache, 1);
            } catch(e) {
                showError(e) 
            }
        }
    }

    const handleKeyWordKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.keyCode === 13) {
            searchByKeyword()
            return false
        } else if (event.keyCode === 27) {
            setKeyword('')
            setResults([])
        }
    }

    const handleKeywordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setKeyword(event.target.value)
    }

    const selectProduct = (product: any) => {
        if (
            (ampSDK?.type === 'objects' || ampSDK?.type === 'strings') &&
            ampSDK.maxItems &&
            selectedProducts.length >= ampSDK.maxItems
        ) {
            setAlertMessage(
                "You've reached the maximum amount of selectable items"
            )
            setShowAlert(true)
        } else {
            // TODO: [NOVADEV-980] Update UX to validate if user wants to add variants of a master
            const match = selectedProducts.find(
                (p) => {
                    // if there is a sku
                    if(  p.selectedVariant.sku ){
                        return p.selectedVariant.sku === product.variants[0].sku
                    } else {
                        // The is no sku so use the ID to match
                        return p.selectedVariant.id === product.variants[0].id
                    }
                }
            )
            if (match) {
                setAlertMessage("You've already selected this item")
                setShowAlert(true)
            } else if (ampSDK?.type === 'string' || ampSDK?.type === 'object') {
                // For single selection, replace the selected product.
                setSelectedProducts((selectedProducts) => [
                    {
                        ...product,
                        deleteKey: selectedProducts.length,
                        selectedVariant: product.variants[0]
                    }
                ])
            } else {
                setSelectedProducts((selectedProducts) => [
                    ...selectedProducts,
                    {
                        ...product,
                        deleteKey: selectedProducts.length,
                        selectedVariant: product.variants[0]
                    }
                ])
            }
        }
    }

    const removeProduct = (productTile: any) => {
        setSelectedProducts(
            selectedProducts.filter(
                (p) => p.deleteKey !== productTile.deleteKey
            )
        )
    }

    const getContainerHeight = useCallback(() => {
        const newHeight = container.current.clientHeight
        setHeight(newHeight)
    }, [container])

    const updateSelected = useCallback(
        (selectedProducts) => {
            if (loading) {
                return;
            }

            if (selectedProducts.length) {
                let result
                switch (ampSDK?.type) {
                    case 'string':
                        const formStr = selectedProducts.map((prod) => prod.id)
                        result = formStr[0]
                        break
                    case 'strings':
                        const formStrs = selectedProducts.map((prod) => prod.id)
                        result = formStrs
                        break
                    case 'object':
                        const formVal = {
                            id: selectedProducts[0].id,
                            variant: selectedProducts[0].selectedVariant?.sku
                        }
                        result = formVal
                        break
                    case 'objects':
                        const formVals = selectedProducts.map((prod) => ({
                            id: prod.id,
                            variant: prod.selectedVariant?.sku
                        }))
                        result = formVals
                        break

                    default:
                        break
                }

                if (!isEqual(lastValue, result)) {
                    ampSDK.setValue(result)
                    setLastValue(result)
                }
            } else if (lastValue != null) {
                ampSDK.clearValue()
                setLastValue(undefined)
            }
        },
        [ampSDK, loading, lastValue]
    )

    useEffect(() => {
        if (!mode) keywordInput.current.value = ''
        setResults([])
        setLoadingResults(false)
        requestInfo.id++
    }, [mode, requestInfo])

    useEffect(() => {
        setTimeout(() => {
            getContainerHeight()
        }, 100)
    }, [results, selectedProducts, getContainerHeight])

    useEffect(() => {
        window.addEventListener('resize', getContainerHeight)

        return () => {
            window.removeEventListener('resize', getContainerHeight)
        }
    }, [getContainerHeight])

    useEffect(() => {
        ampSDK.setHeight(height + 100)
    }, [height, ampSDK])

    // Whenever selectedProducts list changes, save to dc forms
    useEffect(() => {
        updateSelected(selectedProducts)
    }, [selectedProducts])

    // Process values stored in the dc form to put into selecteProducts
    useEffect(() => {
        const getProducts = async (ids) => {
            if (ids === '' || ids == null) { 
                return []
            }
            try { 
                const p = await ampSDK.commerceApi.getProducts({
                    productIds: ids
                })
                return p.filter((item: any) => item !== null)
            } catch(e) {
                showError(e)
                return []
            }
        }
        // form comma-delim ID string
        if (storedValue != undefined) {
            let Ids: string
            switch (ampSDK?.type) {
                case 'string':
                    Ids = ampSDK.isEnforced()
                        ? storedValue.split('/').pop()
                        : storedValue
                    break
                case 'strings':
                    Ids = storedValue.join(',')
                    break
                case 'object':
                    Ids = storedValue.id
                    break
                case 'objects':
                    Ids = storedValue.map((prod: any) => prod.id).join(',')
                    break
                default:
                    break
            }
            setLoading(true)
            getProducts(Ids).then((res) => {
                setLoading(false)
                let prod = res.map((item: any, index: number) => {
                    const selVar = item.variants.find(
                        (v: any) => v.id === storedValue.variant
                    )
                    return {
                        ...item,
                        deleteKey: index,
                        selectedVariant:
                            selVar !== undefined ? selVar : item.variants[0]
                    }
                })

                setSelectedProducts(prod)
            })
        } else {
            setLoading(false)
        }
    }, [storedValue, ampSDK])

    return (
        <div ref={container}>
            <Dialog open={showAlert} onClose={() => setShowAlert(false)}>
                <Card variant='outlined'>
                    <CardContent style={{whiteSpace: "pre-wrap"}}>{alertMessage}</CardContent>
                </Card>
            </Dialog>
            <Backdrop
                sx={{
                    color: '#77f',
                    backgroundColor: 'rgba(200,200,200,0.6)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
                open={loading}
            >
                <CircularProgress color='inherit' />
            </Backdrop>

            {/* Sortable Selected Products */}
            {selectedProducts.length ? (
                <>
                    <Typography
                        mt={1}
                        variant='h3'
                        fontSize={'12px'}
                        fontWeight={'normal'}
                        color={'#597684'}
                    >
                        Selected products
                    </Typography>
                    <SortableList
                        selectedProducts={selectedProducts}
                        dataType={ampSDK?.type}
                        updateSelected={updateSelected}
                        removeProduct={removeProduct}
                    />
                </>
            ) : (
                <></>
            )}

            {/* Dual Mode Search */}

            <Tabs
                value={mode}
                onChange={tabChange}
                aria-label='search mode tabs'
                sx={{ marginBottom: '14px', textTransform:'none' }}
            >
                <Tab label='Keyword search' sx={{ textTransform:'none' }}/>
                <Tab label='Category search' sx={{ textTransform:'none' }}/>
            </Tabs>
            <TabPanel value={mode} index={0}>
                <Box sx={{ display: 'flex' }}>
                    <TextField
                        inputRef={keywordInput}
                        size='small'
                        sx={{ ml: 1, flex: 1, "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } }}
                        label='Keyword search (esc. to clear)'
                        color='primary'
                        variant='outlined'
                        inputProps={{
                            'aria-label': 'keyword search (escape key to clear)'
                        }}
                        onKeyDown={handleKeyWordKeydown}
                        onChange={handleKeywordChange}
                        value={keyword}
                    />
                    <IconButton
                        type='button'
                        onClick={searchByKeyword}
                        sx={{ ml: '5px', p: '8px',color:'#597684' }}
                        aria-label='search'
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>
            </TabPanel>
            <TabPanel value={mode} index={1}>
                <Autocomplete
                    disablePortal
                    id='combo-box-demo'
                    size='small'
                    options={ampSDK.getValues()}
                    getOptionLabel={(option) => option.name || ''}
                    sx={{
                        width: '100%',
                        marginTop: '0',
                        paddingLeft: '8px',
                        "& label":{color: '#597681'},"& fieldset": { borderColor: '#b4c0f2', borderRadius: '.5rem' }, "& fieldset:hover": { borderColor: '#b4bef2' } 
                    }}
                    value={storedValue}
                    onChange={(event, val) => {
                        if (val !== null) {
                            console.log("VALUE", val)
                            searchByCategory(val)
                        }
                    }}
                    onClose={() => {
                        ampSDK.setHeight(Math.max(height + 100, 260))
                    }}
                    onOpen={() => {
                        ampSDK.setHeight(Math.max(height + 100, 540))
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label={ampSDK.label} />
                    )}
                />
            </TabPanel>

            <div style={{position: 'relative'}}>
                <Backdrop
                    sx={{
                        color: '#77f',
                        backgroundColor: 'rgba(200,200,200,0.6)',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute'
                    }}
                    open={loadingResults}
                >
                    <CircularProgress color='inherit' />
                </Backdrop>
                {results.length ? (
                    <>
                        <Typography
                            mt={2}
                            variant='h3'
                            fontSize={'12px'}
                            fontWeight={'normal'}
                            color={'#597684'}
                        >
                            Search results (click to select products)
                        </Typography>
                        <ImageList
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexWrap: 'wrap'
                            }}
                            gap={10}
                            rowHeight={140}
                        >
                            {results
                                .map((product: any, index: number) => {
                                    return (
                                        <ProductTile
                                            key={
                                                index +
                                                loadedPage * itemsPerPage +
                                                product.id
                                            }
                                            dataType={ampSDK?.type}
                                            size={140}
                                            product={product}
                                            selectProduct={selectProduct}
                                        />
                                    )
                                })}
                        </ImageList>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}

export default ProductSelector
