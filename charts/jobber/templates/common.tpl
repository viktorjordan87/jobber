{{- define "common.env" }}
- name: PULSAR_SERVICE_URL
  value: {{ printf "pulsar://%s-pulsar-broker.%s.svc.cluster.local:6650" .Release.Name .Release.Namespace | quote }}
- name: DATABASE_URL
  value: {{ printf "postgresql://%s:%s@%s-postgresql.%s.svc.cluster.local:5432/%s" .Values.postgresql.auth.username (.Values.postgresql.auth.password | urlquery) .Release.Name .Release.Namespace .Values.postgresql.auth.database | quote }}
{{- end }}
