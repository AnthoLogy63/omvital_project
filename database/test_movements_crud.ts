// test_movements_crud.ts
import { insertMovement, getMovements, updateMovement, deleteMovement, getLatestCajaCierre } from "../src/lib/api/movements";

// Set process env variables explicitly if needed since Bun loads them
console.log("Starting movements CRUD integration test...");

async function runTest() {
  try {
    // 1. Fetch initially
    console.log("\n1. Fetching initial movements...");
    const initialMovs = await getMovements();
    console.log(`✅ Success. Count: ${initialMovs.length}`);

    // 2. Insert test movement
    console.log("\n2. Inserting a test movement...");
    const newMov = await insertMovement({
      data: {
        tipo: "Ingreso",
        concepto: "Test Movimiento - Sesión Fisioterapia",
        categoria: "Caja",
        metodo: "Efectivo",
        monto: 85.50,
        estado: "Completado",
        nota: "Test de integración",
      }
    });
    console.log("✅ Success. Inserted:", newMov);

    // 3. Update the movement
    console.log("\n3. Updating the test movement...");
    const updatedMov = await updateMovement({
      data: {
        id: newMov.id,
        tipo: "Ingreso",
        concepto: "Test Movimiento - Sesión Modificado",
        categoria: "Paquete",
        metodo: "Transferencia",
        monto: 120.00,
        estado: "Completado",
        nota: "Test de integración modificado",
      }
    });
    console.log("✅ Success. Updated:", updatedMov);

    // 4. Fetch to verify presence
    console.log("\n4. Verifying update in database list...");
    const afterInsertMovs = await getMovements();
    const found = afterInsertMovs.find(m => m.id === newMov.id);
    if (found && found.concepto === "Test Movimiento - Sesión Modificado" && found.monto === 120) {
      console.log("✅ Verified. The movement is successfully updated in the list.");
    } else {
      throw new Error("❌ Verification failed. Movement not found or not updated.");
    }

    // 5. Delete movement
    console.log("\n5. Deleting the test movement...");
    const delResult = await deleteMovement({
      data: { id: newMov.id }
    });
    console.log("✅ Success. Delete result:", delResult);

    // 6. Final verification
    console.log("\n6. Verifying deletion in database list...");
    const finalMovs = await getMovements();
    const stillExists = finalMovs.some(m => m.id === newMov.id);
    if (!stillExists) {
      console.log("✅ Verified. The movement is no longer in the database.");
    } else {
      throw new Error("❌ Verification failed. Movement still exists in the list.");
    }

    // 7. Get latest closure
    console.log("\n7. Fetching latest caja closure...");
    const closure = await getLatestCajaCierre();
    console.log("✅ Success. Latest closure:", closure);

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  }
}

runTest();
