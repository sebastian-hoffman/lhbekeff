"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, Check, CheckCircle2, CreditCard, Loader2, MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createShopOrder } from "@/server/actions/shop.actions";
import { formatPrice, isPresaleOpen, PRODUCTS, SHIRT_SIZES, type ProductId } from "@/lib/shop";
import { useShopStore } from "@/store/shop-store";
import shirtImage from "../../../info/Remera majane shabat v2.png";
import bottleImage from "../../../info/Botellas LAMROTH.png";
import towelImage from "../../../info/Toalla azul LAMROTH.png";
import styles from "./storefront.module.css";

const productImages = { remera: shirtImage, botella: bottleImage, toallon: towelImage };

export function Storefront({ open }: { open: boolean }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [available, setAvailable] = useState(open);
  const items = useShopStore((state) => state.items);
  const quantity = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    void useShopStore.persist.rehydrate();
    const timer = setInterval(() => setAvailable(isPresaleOpen()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.shop}>
      <div className={styles.announcement}>
        <span className={styles.liveDot} />
        {available ? "PREVENTA ABIERTA" : "PREVENTA FINALIZADA"}
        <span className={styles.announcementDetail}>PRECIOS ESPECIALES HASTA EL 13 DE NOVIEMBRE</span>
        <span className={styles.mobileDeadline}>HASTA EL 13/11</span>
        <ArrowRight size={14} aria-hidden="true" />
      </div>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Lamroth, inicio">
          <Image src="/productos/lamroth-mark.png" alt="" width={38} height={32} />
          LAMROTH<span className={styles.brandEdition}>MAJANÉ / 2026</span>
        </Link>
        <nav className={styles.nav} aria-label="Navegación principal">
          <a href="#productos">La colección</a>
          <a href="#preventa">La preventa</a>
        </nav>
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogTrigger asChild>
            <button className={styles.cartButton} aria-label={`Abrir carrito, ${quantity} productos`}>
              <ShoppingBag size={19} /><span className={styles.cartText}>Mi pedido</span>
              <span className={styles.cartCount}>{quantity}</span>
            </button>
          </DialogTrigger>
          <DialogContent className={styles.drawer}>
            <Cart available={available} onClose={() => setCartOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroTop}>
            <p className={styles.eyebrow}>LO QUE NOS UNE, SE LLEVA PUESTO.</p>
            <span className={styles.edition}>COLECCIÓN MAJANÉ 2026</span>
          </div>
          <h1 id="hero-title">La remera<br />de <span>Shabat.</span></h1>
          <div className={styles.heroImage}>
            <Image src={shirtImage} alt="Remera blanca de Shabat Lamroth: frente con logo y espalda con diseño de nombres formando las velas" priority sizes="100vw" />
          </div>
          <div className={styles.heroSticker} aria-label="Precio especial de preventa: 15.000 pesos">
            <span>DONACIÓN PREVENTA</span><strong>$15.000</strong><span>HASTA EL 13/11</span>
          </div>
          <div className={styles.heroBottom}>
            <p>No te podés quedar sin<br /><strong>la remera de Shabat.</strong></p>
            <a href="#productos" className={styles.primaryButton}>Quiero la mía <ArrowDown size={19} /></a>
            <span className={styles.heroCaption}>NOMBRES QUE ENCIENDEN.<br />RECUERDOS QUE TE ACOMPAÑAN.</span>
          </div>
        </section>

        <div className={styles.ticker} aria-hidden="true">
          <span>MUCHO MÁS QUE UNA REMERA</span><span>✳</span><span>ES SER PARTE</span><span>✳</span><span>ES LAMROTH</span><span>✳</span><span>MUCHO MÁS QUE UNA REMERA</span>
        </div>

        <section id="productos" className={styles.collection} aria-labelledby="collection-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>TRES PRODUCTOS. UNA MISMA IDENTIDAD.</p><h2 id="collection-title">Llevá Lamroth con vos.</h2></div>
            <p>Elegí tus favoritos.<br />Aprovechá el precio de preventa.</p>
          </div>
          <div className={styles.productGrid}>
            {PRODUCTS.map((product, index) => <Product key={product.id} id={product.id} index={index} available={available} onCart={() => setCartOpen(true)} />)}
          </div>
        </section>

        <section id="preventa" className={styles.presale} aria-labelledby="presale-title">
          <div className={styles.presaleHeadline}><p className={styles.eyebrow}>AHORA ES EL MOMENTO.</p><h2 id="presale-title">Precio especial.<br /><span>Por tiempo limitado.</span></h2><p>La preventa cierra el <strong>13 de noviembre de 2026.</strong><br />Tu próximo recuerdo de Lamroth empieza acá.</p><a href="#productos" className={styles.darkButton}>Elegir mis productos <ArrowRight size={18} /></a></div>
          <div className={styles.presaleFacts}>
            <div><span>01</span><div><h3>Elegí lo que va con vos.</h3><p>Remera, botellita o toallón. Podés combinar productos y talles en tu pedido.</p></div></div>
            <div><span>02</span><div><h3>Asegurá tu precio de preventa.</h3><p>Pagá con transferencia o Mercado Pago. Guardá el código de tu pedido.</p></div></div>
            <div><span>03</span><div><h3>Nos vemos en Lamroth.</h3><p>Entrega en sedes de Lamroth. La fecha y la coordinación del retiro se informarán próximamente.</p></div></div>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title">Antes de pedir.</h2>
          <div>
            <details><summary>¿Qué talles tiene la remera?</summary><p>Talles 6, 8, 10, 12, 14 y 16; S, M, L y XL. Elegí el talle antes de sumar cada remera. La tabla de medidas todavía no está disponible.</p></details>
            <details><summary>¿Puedo comprar varios productos y talles?</summary><p>Sí. Agregá cada talle al carrito por separado y elegí la cantidad que necesitás. Podés sumar botellitas y toallones al mismo pedido.</p></details>
            <details><summary>¿Se puede elegir el color de la botella?</summary><p>No se elige color. La imagen muestra los acabados del producto. La botella es de aluminio, tiene 600 ml de capacidad y colgante de silicona negra.</p></details>
            <details><summary>¿Cómo recibo mi pedido?</summary><p>La entrega se realiza en sedes de Lamroth. La fecha y la coordinación del retiro se informarán próximamente. No se ofrece envío a domicilio.</p></details>
            <details><summary>¿Hasta cuándo puedo comprar en preventa?</summary><p>Hasta el 13 de noviembre de 2026 inclusive, hora de Argentina. Después del cierre no se aceptan nuevos pedidos a estos precios.</p></details>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>LAMROTH<span>LO QUE NOS UNE.</span></Link>
        <p>MAJANÉ 2026<br />Hecho para ser parte.</p>
        <Link href="/comprobante">Cargar comprobante <ArrowRight size={15} /></Link>
        <span>© 2026 Lamroth</span>
      </footer>
    </div>
  );
}

function Product({ id, index, available, onCart }: { id: ProductId; index: number; available: boolean; onCart: () => void }) {
  const product = PRODUCTS.find((entry) => entry.id === id)!;
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const add = useShopStore((state) => state.add);
  const descriptions = {
    remera: "Blanca. Con nuestros nombres, nuestra identidad y todo lo que nos une.",
    toallon: "El azul de Lamroth, también en tus días de sol. Toallón azul con identidad Majané 2026.",
  };
  function addProduct() {
    if (product.requiresSize && !size) { setSizeError(true); return; }
    add({ productId: id, size, quantity });
    onCart();
  }
  return (
    <article className={styles.product}>
      <div className={`${styles.productImage} ${styles[id]}`}>
        <span className={styles.productNumber}>0{index + 1}</span>
        <span className={styles.productTag}>{id === "remera" ? "LA PROTAGONISTA" : "DONACIÓN PREVENTA"}</span>
        <Image src={productImages[id]} alt={id === "remera" ? "Frente, espalda y detalle de la remera de Shabat" : product.name} sizes="(max-width: 760px) 100vw, 33vw" />
      </div>
      <div className={styles.productTitle}><h3>{product.name}</h3><strong>{formatPrice(product.priceCents)}</strong></div>
      {id !== "botella" && <p className={styles.productDescription}>{descriptions[id]}</p>}
      {product.requiresSize && <fieldset className={styles.sizes} aria-describedby={sizeError ? "size-error" : undefined}>
        <legend>Elegí tu talle <span>Obligatorio</span></legend>
        <div>{SHIRT_SIZES.map((option) => <label key={option} className={size === option ? styles.selectedSize : ""}>
          <input type="radio" name="shirt-size" value={option} checked={size === option} onChange={() => { setSize(option); setSizeError(false); }} /><span>{option}</span>
        </label>)}</div>
        {sizeError && <p id="size-error" role="alert" className={styles.error}>Elegí un talle para agregar la remera.</p>}
      </fieldset>}
      <div className={styles.productActions}>
        <Quantity value={quantity} onChange={setQuantity} label={`Cantidad de ${product.name}`} />
        <button className={styles.addButton} onClick={addProduct} disabled={!available}>{available ? "Agregar al pedido" : "Preventa cerrada"}<Plus size={18} /></button>
      </div>
    </article>
  );
}

function Quantity({ value, onChange, label, disabled = false }: { value: number; onChange: (value: number) => void; label: string; disabled?: boolean }) {
  return <div className={styles.quantity} role="group" aria-label={label}>
    <button type="button" title="Disminuir cantidad" aria-label={`Disminuir ${label}`} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}><Minus size={14} /></button>
    <output aria-live="polite">{value}</output>
    <button type="button" title="Aumentar cantidad" aria-label={`Aumentar ${label}`} disabled={disabled || value >= 99} onClick={() => onChange(value + 1)}><Plus size={14} /></button>
  </div>;
}

function Cart({ available, onClose }: { available: boolean; onClose: () => void }) {
  const router = useRouter();
  const { items, setQuantity, clear } = useShopStore();
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const total = items.reduce((sum, item) => sum + PRODUCTS.find((product) => product.id === item.productId)!.priceCents * item.quantity, 0);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await createShopOrder({
          buyerName: form.get("buyerName"), buyerEmail: form.get("buyerEmail"), buyerPhone: form.get("buyerPhone"), items,
        });
        if (!result.success) { setError(result.error); return; }
        clear();
        router.push(`/pedido/${result.code}`);
      } catch { setError("No pudimos conectar. Tu pedido sigue en el carrito. Volvé a intentar."); }
    });
  }
  return <>
    <DialogHeader className={styles.cartHeader}><DialogTitle>Tu pedido.</DialogTitle><DialogDescription>Precio especial de preventa · Lamroth 2026</DialogDescription></DialogHeader>
    {items.length === 0 ? <div className={styles.emptyCart}><ShoppingBag size={48} strokeWidth={1} /><h3>Tu próximo recuerdo te espera.</h3><p>Elegí tus favoritos de la colección.</p><button className={styles.primaryButton} onClick={onClose}>Ver productos <ArrowRight size={18} /></button></div> : <>
      <div className={styles.cartItems}>
        {items.map((item) => {
          const product = PRODUCTS.find((entry) => entry.id === item.productId)!;
          return <div key={`${item.productId}-${item.size}`} className={styles.cartItem}>
            <Image src={productImages[item.productId]} alt={product.name} width={90} height={90} />
            <div><h3>{product.name}</h3><p>{item.size ? `Talle ${item.size}` : item.productId === "toallon" ? "Azul" : "600 ml · Sin elección de color"}</p><Quantity value={item.quantity} disabled={isPending} onChange={(quantity) => setQuantity(item.productId, item.size, quantity)} label={product.name} /></div>
            <div className={styles.cartItemPrice}><strong>{formatPrice(product.priceCents * item.quantity)}</strong><button disabled={isPending} type="button" title="Quitar producto" aria-label={`Quitar ${product.name}${item.size ? ` talle ${item.size}` : ""}`} onClick={() => setQuantity(item.productId, item.size, 0)}><Trash2 size={17} /></button></div>
          </div>;
        })}
      </div>
      <div className={styles.cartTotal}><span>Total de preventa</span><strong>{formatPrice(total)}</strong></div>
      <p className={styles.cartDelivery}><MapPin size={17} />Entrega en sedes de Lamroth</p>
      {!available && <p className={styles.error} role="alert">La preventa finalizó. No se pueden crear pedidos nuevos.</p>}
      {!checkout ? <button className={styles.primaryButton} disabled={!available} onClick={() => setCheckout(true)}>Continuar con mi pedido <ArrowRight size={18} /></button> : <form onSubmit={submit} className={styles.checkoutForm}>
        <h3>Tus datos</h3>
        <label>Nombre y apellido<input name="buyerName" autoComplete="name" required minLength={3} maxLength={120} disabled={isPending} /></label>
        <label>Email<input name="buyerEmail" type="email" autoComplete="email" required disabled={isPending} /></label>
        <label>Celular<input name="buyerPhone" type="tel" autoComplete="tel" required minLength={6} maxLength={30} pattern={"[0-9\\s+\\(\\)\\-]+"} disabled={isPending} /></label>
        <p>Entrega en sedes de Lamroth. Fecha y coordinación del retiro a confirmar.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.primaryButton} disabled={isPending || !available} type="submit">{isPending ? <><Loader2 size={18} className="animate-spin" />Guardando pedido…</> : <>Confirmar e ir al pago <ArrowRight size={18} /></>}</button>
        <span className={styles.securePayment}><CreditCard size={15} />Transferencia o Mercado Pago <Check size={14} /></span>
      </form>}
      <p className={styles.cartFootnote}><CheckCircle2 size={15} />Precios finales en pesos argentinos.</p>
    </>}
  </>;
}