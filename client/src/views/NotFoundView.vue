<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Η σελίδα δεν βρέθηκε.</p>
    <RouterLink to="/" class="home-link">Πίσω στις Συνταγές</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: var(--space-2xl) 0;
}

.not-found h1 {
  font-size: 4rem;
  font-weight: 700;
  color: var(--color-border);
  margin-bottom: var(--space-sm);
}

.not-found p {
  font-size: 1.15rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.home-link {
  display: inline-block;
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background 0.2s;
}

.home-link:hover {
  background: var(--color-primary-light);
  color: white;
}
</style>
