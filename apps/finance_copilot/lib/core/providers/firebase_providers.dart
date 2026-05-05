import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'firebase_providers.g.dart';

@riverpod
FirebaseAuth firebaseAuth(FirebaseAuthRef ref) {
  return FirebaseAuth.instance;
}

@riverpod
FirebaseFirestore firebaseFirestore(FirebaseFirestoreRef ref) {
  return FirebaseFirestore.instance;
}

/// Provider para observar el estado de autenticación del usuario actual
@riverpod
Stream<User?> authStateChanges(AuthStateChangesRef ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
}

/// Provider para obtener el usuario actual de forma síncrona (si está logueado)
@riverpod
User? currentUser(CurrentUserRef ref) {
  return ref.watch(firebaseAuthProvider).currentUser;
}
